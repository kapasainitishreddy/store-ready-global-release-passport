import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanReleaseProofFiles, releaseReportMarkdown, releaseEvidenceHtml, releaseProofLimits } from './src/engine.mjs';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(appRoot, 'public');
const fixtureRoot = path.resolve(appRoot, '../../examples/releaseproof');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self' https://api.github.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'Cache-Control': 'no-store',
    ...extra
  };
}

function sendJson(response, status, value) {
  response.writeHead(status, securityHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
  response.end(JSON.stringify(value));
}

async function loadFixture(variant) {
  const root = path.resolve(fixtureRoot, `${variant}-app`);
  if (!root.startsWith(`${fixtureRoot}${path.sep}`)) throw new Error('Invalid fixture selection');
  const files = [];
  let totalBytes = 0;

  async function walk(relative = '') {
    const directory = path.join(root, relative);
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error('Demo fixture contains an unsafe symbolic link');
      if (entry.isDirectory()) {
        if (releaseProofLimits.ignoredDirectories.includes(entry.name)) continue;
        await walk(child);
      } else if (entry.isFile()) {
        const fullPath = path.join(root, child);
        const stat = await fs.stat(fullPath);
        if (stat.size > releaseProofLimits.maxFileBytes) continue;
        totalBytes += stat.size;
        if (totalBytes > releaseProofLimits.maxTotalBytes || files.length >= releaseProofLimits.maxFiles) throw new Error('Demo fixture exceeds scan limits');
        files.push({ path: child, content: await fs.readFile(fullPath, 'utf8') });
      }
    }
  }

  await walk();
  return { files, root };
}

export async function auditFixture(variant) {
  if (!['broken', 'fixed'].includes(variant)) throw Object.assign(new Error('Choose the broken or fixed demo fixture.'), { statusCode: 400 });
  const { files } = await loadFixture(variant);
  const report = scanReleaseProofFiles(files, { project: `examples/releaseproof/${variant}-app`, ref: 'demo fixture' });
  report.demoVariant = variant;
  report.fileCount = files.length;
  return { report, markdown: releaseReportMarkdown(report), evidenceHtml: releaseEvidenceHtml(report) };
}

export function createReleaseProofServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (request.method === 'GET' && url.pathname === '/api/audit') {
        const variant = url.searchParams.get('variant') || 'broken';
        return sendJson(response, 200, await auditFixture(variant));
      }
      const staticFiles = { '/': 'index.html', '/index.html': 'index.html', '/releaseproof.css': 'releaseproof.css', '/releaseproof.js': 'releaseproof.js', '/market-catalog.js': 'market-catalog.js', '/github-repository.js': 'github-repository.js', '/scanner-engine.js': 'scanner-engine.js' };
      const filename = staticFiles[url.pathname];
      if (request.method === 'GET' && filename) {
        const content = await fs.readFile(path.join(publicRoot, filename));
        response.writeHead(200, securityHeaders({ 'Content-Type': contentTypes[path.extname(filename)] }));
        response.end(content);
        return;
      }
      response.writeHead(404, securityHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }));
      response.end('Not found');
    } catch (error) {
      const status = error.statusCode || (error.message.includes('limit') ? 413 : 500);
      sendJson(response, status, { error: status === 500 ? 'ReleaseProof demo scan failed.' : error.message });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createReleaseProofServer().listen(port, '127.0.0.1', () => console.log(`ReleaseProof by StoreReady running at http://127.0.0.1:${port}`));
}
