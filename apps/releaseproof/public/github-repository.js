const API = 'https://api.github.com';
const MAX_BLOBS = 16;
const MAX_FILE_BYTES = 256 * 1024;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;
const decoder = new TextDecoder('utf-8', { fatal: true });
const sourcePattern = /\.(?:mjs|cjs|js|ts|tsx|jsx|json|ya?ml|env|html|py|java|kt|kts|swift|dart|go|rs|rb|php|cs|gradle|xml|toml|properties)$/i;
const ignoredPart = /^(?:\.git|node_modules|dist|build|coverage|vendor|\.next|\.gradle|Pods)$/i;

export function parseGitHubRepositoryUrl(value) {
  let parsed;
  try { parsed = new URL(String(value || '').trim()); }
  catch { throw new Error('Enter a public GitHub repository URL such as https://github.com/owner/repo.'); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('Use a plain https://github.com/owner/repo URL without credentials or query parameters.');
  }
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length !== 2) throw new Error('Use the repository root URL, not a file or branch URL.');
  const [owner, rawRepo] = parts;
  const repo = rawRepo.replace(/\.git$/i, '');
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || repo === '.' || repo === '..') {
    throw new Error('The GitHub owner or repository name is invalid.');
  }
  return { owner, repo, url: `https://github.com/${owner}/${repo}` };
}

function safePath(path) {
  return typeof path === 'string' && path.length > 0 && path.length <= 500 && !path.startsWith('/') && !path.includes('\\') && !path.includes('\0') && path.split('/').every(part => part && part !== '.' && part !== '..' && !ignoredPart.test(part));
}

function rank(entry) {
  const path = entry.path;
  if (path === 'package.json') return 0;
  if (/^\.env(?:\..+)?$/i.test(path)) return 1;
  if (/^(?:src|app|apps|api|server|lib|pages)\//i.test(path)) return 2;
  if (!path.includes('/')) return 3;
  return 4;
}

async function apiJson(url, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    try {
      response = await fetchImpl(url, { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', signal: controller.signal });
    } catch (error) {
      throw new Error(error?.name === 'AbortError' ? 'GitHub did not respond within 12 seconds.' : 'Could not reach GitHub. Check your connection and retry.');
    }
    if (response.status === 404) throw new Error('GitHub could not find a public repository at that URL.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub API access is limited right now. Retry after its unauthenticated rate limit resets.');
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}. Retry later.`);
    const length = Number(response.headers?.get?.('content-length') || 0);
    if (length > 8 * 1024 * 1024) throw new Error('GitHub returned more inventory data than this demo can safely read.');
    try { return await response.json(); }
    catch (error) { throw new Error(error?.name === 'AbortError' ? 'GitHub did not respond within 12 seconds.' : 'GitHub returned an unreadable repository response.'); }
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadPublicGitHubRepository(value, { fetchImpl = fetch, onProgress = () => {} } = {}) {
  const { owner, repo, url } = parseGitHubRepositoryUrl(value);
  const base = `${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  onProgress('Reading public repository details…');
  const metadata = await apiJson(base, fetchImpl);
  if (metadata.private === true || typeof metadata.default_branch !== 'string' || !metadata.default_branch) throw new Error('This repository must be public and have a default branch.');
  onProgress('Listing files on the default branch…');
  const tree = await apiJson(`${base}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`, fetchImpl);
  if (!Array.isArray(tree.tree) || !/^[0-9a-f]{40}$/i.test(String(tree.sha || ''))) throw new Error('GitHub returned an invalid repository tree.');
  const blobs = tree.tree.filter(entry => entry?.type === 'blob' && /^(?:100644|100755)$/.test(String(entry.mode)) && safePath(entry.path) && /^[0-9a-f]{40}$/i.test(String(entry.sha || '')));
  const inventoryPaths = blobs.map(entry => entry.path);
  const eligible = blobs.filter(entry => (sourcePattern.test(entry.path) || /^\.env(?:\..+)?$/i.test(entry.path)) && Number.isInteger(entry.size) && entry.size >= 0);
  const small = eligible.filter(entry => entry.size <= MAX_FILE_BYTES).sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path));
  const selected = small.slice(0, MAX_BLOBS);
  const gaps = [{ category: 'audit scope', reason: 'This bounded static sample does not establish complete security, legal, store-policy, runtime, or dependency-advisory coverage.' }];
  if (tree.truncated) gaps.push({ category: 'repository inventory', reason: 'GitHub truncated the recursive file tree; some paths are unknown.' });
  if (eligible.length > small.length) gaps.push({ category: 'large files', reason: `${eligible.length - small.length} eligible text file(s) exceeded the 256 KiB per-file limit.` });
  if (small.length > selected.length) gaps.push({ category: 'file sampling', reason: `Only ${selected.length} of ${small.length} eligible small text files were selected for source checks.` });
  const files = [];
  let totalBytes = 0;
  let unreadable = 0;
  for (const [index, entry] of selected.entries()) {
    onProgress(`Reading ${index + 1} of ${selected.length} selected files…`);
    const blob = await apiJson(`${base}/git/blobs/${entry.sha}`, fetchImpl);
    if (blob.encoding !== 'base64' || typeof blob.content !== 'string') { unreadable++; continue; }
    try {
      const encoded = blob.content.replace(/\s/g, '');
      const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
      if (bytes.byteLength !== entry.size || totalBytes + bytes.byteLength > MAX_TOTAL_BYTES) { unreadable++; continue; }
      files.push({ path: entry.path, content: decoder.decode(bytes) });
      totalBytes += bytes.byteLength;
    } catch { unreadable++; }
  }
  if (unreadable) gaps.push({ category: 'unreadable files', reason: `${unreadable} selected file(s) could not be decoded within the text and size limits.` });
  if (!files.length) throw new Error('No eligible UTF-8 text files could be read from this repository.');
  return {
    url, owner, repo, branch: metadata.default_branch,
    ref: `${metadata.default_branch} · tree ${tree.sha.slice(0, 12)}`,
    files, inventoryPaths, externalCoverageGaps: gaps,
    selectedCount: files.length, availableCount: inventoryPaths.length
  };
}

export const githubScanLimits = Object.freeze({ maxFiles: MAX_BLOBS, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES });
