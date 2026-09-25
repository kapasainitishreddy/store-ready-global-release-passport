import crypto from 'node:crypto';

const MAX_FILES = 4000;
const MAX_FILE_BYTES = 256 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const allowedSeverity = new Set(['critical', 'high', 'medium', 'low', 'info']);
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const normalizePath = value => {
  if (typeof value !== 'string' || !value || value.length > 500 || value.includes('\\') || value.startsWith('/')) {
    throw new Error('Invalid repository path');
  }
  const parts = value.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || part.includes('\0'))) throw new Error('Unsafe repository path');
  return value;
};
const findingId = (rule, file, line) => crypto.createHash('sha256').update(`${rule}:${file}:${line}`).digest('hex').slice(0, 12);
const safeExcerpt = value => value.replace(/((?:api[_-]?key|secret|token|password)\s*[:=]\s*)['"`]?[A-Za-z0-9_./+=:-]{4,}['"`]?/ig, '$1[REDACTED]').slice(0, 200);

function makeFinding({ category, severity, title, description, file, line, rule, scanner, excerpt, whyItMatters, remediation, status = 'open' }) {
  if (!allowedSeverity.has(severity)) throw new Error('Invalid finding severity');
  return {
    id: findingId(rule, file || '', line || 0), category, severity, title, description,
    evidence: { ...(file ? { file } : {}), ...(line ? { line } : {}), rule, scanner, ...(excerpt ? { excerpt: safeExcerpt(excerpt) } : {}) },
    whyItMatters, remediation, autoFixAvailable: false, status
  };
}

export function evaluateReleaseDecision({ findings = [], checks = [], coverageGaps = [] } = {}) {
  if (!Array.isArray(findings) || !Array.isArray(checks) || !Array.isArray(coverageGaps)) throw new Error('Invalid release decision input');
  const open = findings.filter(item => item && item.status !== 'fixed' && item.status !== 'accepted');
  const critical = open.filter(item => item.severity === 'critical').length;
  const high = open.filter(item => item.severity === 'high').length;
  const linkedRules = {
    manifest: ['package-json-parse'], secrets: ['hardcoded-credential-pattern', 'tracked-env-file'],
    tests: ['test-configuration'], build: ['build-configuration'], dependencies: ['dependency-lockfile'],
    ci: ['ci-workflow'], documentation: ['readme-required'], license: ['license-required'],
    deployment: ['deployment-config'], environment: ['tracked-env-file']
  };
  const failedRequired = checks.filter(item => item.required !== false && item.status === 'FAIL');
  const unmatchedFailures = failedRequired.filter(item => !open.some(finding => linkedRules[item.id]?.includes(finding.evidence?.rule)));
  const blockers = critical + high + unmatchedFailures.length;
  const warningChecks = checks.filter(item => item.required !== false && item.status === 'WARNING');
  const unmatchedWarnings = warningChecks.filter(item => !open.some(finding => finding.severity === 'medium' && linkedRules[item.id]?.includes(finding.evidence?.rule)));
  const warnings = open.filter(item => item.severity === 'medium').length + unmatchedWarnings.length;
  const passed = checks.filter(item => item.required !== false && item.status === 'PASS').length;
  return {
    decision: blockers ? 'BLOCK' : coverageGaps.length ? 'REVIEW' : 'READY',
    checksPassed: passed,
    blockers,
    warnings,
    coverageGaps: coverageGaps.length,
    reasons: [...open.filter(item => item.severity === 'critical' || item.severity === 'high').map(item => item.title), ...checks.filter(item => item.required !== false && item.status === 'FAIL').map(item => item.title)]
  };
}

export function scanReleaseProofFiles(input, { project = 'repository', ref = 'local', scannedAt = new Date().toISOString() } = {}) {
  if (!Array.isArray(input) || input.length > MAX_FILES) throw new Error('Repository file limit exceeded');
  const files = new Map();
  let totalBytes = 0;
  for (const row of input) {
    const file = normalizePath(row?.path);
    if (files.has(file)) throw new Error('Duplicate repository path');
    if (typeof row.content !== 'string') throw new Error('Repository file content must be text');
    const size = Buffer.byteLength(row.content, 'utf8');
    if (size > MAX_FILE_BYTES) throw new Error('Repository file size limit exceeded');
    totalBytes += size;
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error('Repository size limit exceeded');
    files.set(file, row.content);
  }

  const findings = [];
  const checks = [];
  const coverageGaps = [];
  const check = (id, category, title, status, detail, required = true) => checks.push({ id, category, title, status, detail, required });
  const packageText = files.get('package.json');
  let packageJson = null;
  if (packageText) {
    try { packageJson = JSON.parse(packageText); }
    catch { findings.push(makeFinding({ category: 'configuration', severity: 'high', title: 'Malformed package manifest', description: 'package.json could not be parsed.', file: 'package.json', rule: 'package-json-parse', scanner: 'releaseproof-static', whyItMatters: 'A malformed manifest prevents repeatable installation and release checks.', remediation: 'Correct package.json and validate it with a JSON parser.' })); }
  }
  check('manifest', 'configuration', 'Project manifest', packageJson ? 'PASS' : 'FAIL', packageJson ? 'package.json parsed successfully.' : 'A valid package.json is required by this web-project profile.');

  const sourceFiles = [...files.entries()].filter(([file]) => /\.(?:mjs|cjs|js|ts|tsx|jsx|json|ya?ml|env|html)$/i.test(file));
  let secretCount = 0;
  for (const [file, content] of sourceFiles) {
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (/\b(?:API[_-]?(?:KEY|TOKEN)|(?:SECRET|TOKEN|PASSWORD)(?:[_-]?(?:KEY|TOKEN))?)\b\s*[:=]\s*['"`][^'"`\s]{4,}['"`]/i.test(line) && !/process\.env\.|import\.meta\.env\./i.test(line)) {
        secretCount++;
        findings.push(makeFinding({ category: 'security', severity: 'high', title: 'Credential-like value in source', description: 'A credential-shaped assignment was found. Values are redacted in evidence.', file, line: index + 1, rule: 'hardcoded-credential-pattern', scanner: 'releaseproof-static', excerpt: line, whyItMatters: 'Secrets committed to source can be copied from repository history and reused.', remediation: 'Move the value to environment configuration, rotate any real credential, and remove it from history where needed.' }));
      }
    });
  }
  check('secrets', 'security', 'Secret pattern scan', secretCount ? 'FAIL' : 'PASS', secretCount ? `${secretCount} credential-like assignment(s) require review.` : 'No credential-like source assignments matched the built-in rule.');

  const scripts = packageJson?.scripts || {};
  const hasTestFiles = [...files.keys()].some(file => /^(?:test|tests)\/.*\.(?:mjs|cjs|js|ts)$/.test(file));
  const hasTestCommand = typeof scripts.test === 'string' && scripts.test.trim().length > 0;
  if (hasTestCommand && hasTestFiles) check('tests', 'testing', 'Test configuration', 'PASS', 'A test command and test source files are present. This static check does not execute project code.');
  else {
    check('tests', 'testing', 'Test configuration', 'FAIL', 'A test command and at least one test source file are required.');
    findings.push(makeFinding({ category: 'testing', severity: 'high', title: 'Required test workflow is missing', description: 'No paired test command and test source file were found.', file: packageText ? 'package.json' : undefined, rule: 'test-configuration', scanner: 'releaseproof-static', whyItMatters: 'Without a repeatable test entry point, changes cannot be checked consistently before release.', remediation: 'Add a test script and a focused test suite for critical behavior.' }));
  }
  check('test-execution', 'testing', 'Test execution', 'NOT_RUN', 'This static profile never executes project-provided test commands.', false);

  const hasBuild = typeof scripts.build === 'string' && scripts.build.trim().length > 0;
  check('build', 'build', 'Build configuration', hasBuild ? 'PASS' : 'WARNING', hasBuild ? 'A build script is present; this audit does not execute it.' : 'No build script was found.');
  if (!hasBuild) findings.push(makeFinding({ category: 'build', severity: 'medium', title: 'Build command is not configured', description: 'package.json has no build script.', file: 'package.json', rule: 'build-configuration', scanner: 'releaseproof-static', whyItMatters: 'The release artifact cannot be reproduced from a documented build command.', remediation: 'Add and document a production build command.' }));
  check('build-execution', 'build', 'Build execution', 'NOT_RUN', 'This static profile never executes project-provided build commands.', false);
  check('lint-execution', 'static-analysis', 'Lint execution', 'NOT_RUN', typeof scripts.lint === 'string' ? 'A lint script is configured but is not executed by this profile.' : 'No lint script was found; no linter is executed by this profile.', false);
  check('typecheck-execution', 'typechecking', 'Typecheck execution', 'NOT_RUN', typeof scripts.typecheck === 'string' ? 'A typecheck script is configured but is not executed by this profile.' : 'No typecheck script was found; no typechecker is executed by this profile.', false);

  const dependencies = { ...(packageJson?.dependencies || {}), ...(packageJson?.devDependencies || {}) };
  const hasLock = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].some(file => files.has(file));
  check('dependencies', 'dependencies', 'Dependency inventory', Object.keys(dependencies).length === 0 || hasLock ? 'PASS' : 'WARNING', Object.keys(dependencies).length === 0 ? 'No third-party packages are declared.' : `${Object.keys(dependencies).length} direct dependency entries found${hasLock ? ' with a lockfile' : ' without a lockfile'}.`);
  if (Object.keys(dependencies).length && !hasLock) findings.push(makeFinding({ category: 'dependencies', severity: 'medium', title: 'Dependency lockfile is missing', description: 'Direct dependencies are declared without a recognized lockfile.', file: 'package.json', rule: 'dependency-lockfile', scanner: 'releaseproof-static', whyItMatters: 'Installs can resolve to different transitive versions over time.', remediation: 'Commit the package manager lockfile and keep it synchronized.' }));
  if (Object.keys(dependencies).length) coverageGaps.push({ category: 'dependencies', status: 'Coverage unavailable', reason: 'No remote advisory database was queried by this offline demo profile.' });

  const workflows = [...files.keys()].filter(file => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(file));
  check('ci', 'ci-cd', 'CI workflow', workflows.length ? 'PASS' : 'WARNING', workflows.length ? `${workflows.length} workflow file(s) found.` : 'No GitHub Actions workflow was found.');
  if (!workflows.length) findings.push(makeFinding({ category: 'ci-cd', severity: 'medium', title: 'Continuous integration workflow is missing', description: 'No workflow exists under .github/workflows/.', file: '.github/workflows', rule: 'ci-workflow', scanner: 'releaseproof-static', whyItMatters: 'The repository has no checked-in automation to run its release checks on changes.', remediation: 'Add a CI workflow that installs dependencies and runs the test and build commands.' }));

  const readme = [...files.keys()].find(file => /^readme\.md$/i.test(file));
  const license = [...files.keys()].find(file => /^license(?:\.md|\.txt)?$/i.test(file));
  check('documentation', 'documentation', 'Project documentation', readme ? 'PASS' : 'WARNING', readme ? 'README.md is present.' : 'README.md is missing.');
  if (!readme) findings.push(makeFinding({ category: 'documentation', severity: 'medium', title: 'README is missing', description: 'No README.md was found at the repository root.', file: 'README.md', rule: 'readme-required', scanner: 'releaseproof-static', whyItMatters: 'Contributors and operators need reproducible setup and release instructions.', remediation: 'Document the project, setup, test, build, and deployment workflow.' }));
  check('license', 'licensing', 'License file', license ? 'PASS' : 'WARNING', license ? `${license} is present; license terms need human review.` : 'No license file was found.');
  if (!license) findings.push(makeFinding({ category: 'licensing', severity: 'medium', title: 'License declaration is missing', description: 'No root license file was found.', file: 'LICENSE', rule: 'license-required', scanner: 'releaseproof-static', whyItMatters: 'The project does not tell others which reuse terms apply.', remediation: 'Add a license that the project owner is authorized to offer.' }));

  const deployConfig = ['vercel.json', 'netlify.toml', 'Dockerfile', 'render.yaml', 'fly.toml'].some(file => files.has(file));
  check('deployment', 'deployment', 'Deployment configuration', deployConfig ? 'PASS' : 'WARNING', deployConfig ? 'A supported deployment configuration file is present.' : 'No supported deployment configuration file was found.');
  if (!deployConfig) findings.push(makeFinding({ category: 'deployment', severity: 'medium', title: 'Deployment configuration is missing', description: 'No supported deployment configuration was found.', rule: 'deployment-config', scanner: 'releaseproof-static', whyItMatters: 'The intended production deployment cannot be checked from repository configuration.', remediation: 'Document the platform and add its production configuration.' }));

  const envFiles = [...files.keys()].filter(file => /^\.env(?:\..+)?$/.test(file) && !/^\.env\.(?:example|sample|template)$/.test(file));
  if (envFiles.length) findings.push(makeFinding({ category: 'security', severity: 'high', title: 'Environment file is tracked', description: 'A non-template .env file is present in the scanned file set.', file: envFiles[0], rule: 'tracked-env-file', scanner: 'releaseproof-static', whyItMatters: 'Environment files often contain local secrets and should not be committed.', remediation: 'Remove the file from version control, rotate any real secrets, and add a safe example file.' }));
  check('environment', 'configuration', 'Environment file hygiene', envFiles.length ? 'FAIL' : 'PASS', envFiles.length ? 'A non-template .env file is tracked.' : 'No tracked non-template .env file was found.');
  check('privacy', 'privacy', 'Privacy declaration review', 'NOT_APPLICABLE', 'This web fixture has no mobile privacy declarations; runtime data use is not assessed.', false);
  check('permissions', 'permissions', 'Platform permission review', 'NOT_APPLICABLE', 'This web fixture contains no mobile permission manifest.', false);
  check('mobile-store', 'mobile', 'Mobile-store readiness', 'NOT_APPLICABLE', 'This fixture is a Node.js web project.', false);

  const decision = evaluateReleaseDecision({ findings, checks, coverageGaps });
  const statuses = ['Security', 'Testing', 'Dependencies', 'Build & Typecheck', 'Deployment', 'Documentation'].map(name => {
    const category = name.toLowerCase().split(' ')[0].replace('&', '');
    const relevant = checks.filter(item => item.category.startsWith(category) || (name === 'Build & Typecheck' && item.category === 'build'));
    let status = relevant.some(item => item.status === 'FAIL') ? 'BLOCKED' : relevant.some(item => item.status === 'WARNING') ? 'REVIEW' : relevant.length ? 'PASS' : 'NOT SCANNED';
    if (['Testing', 'Build & Typecheck'].includes(name) && status === 'PASS') status = 'REVIEW';
    return { name, status };
  });
  const score = Math.max(0, Math.round(100 - decision.blockers * 18 - decision.warnings * 7 - Math.min(decision.coverageGaps * 5, 20)));
  return {
    schemaVersion: 1,
    product: 'ReleaseProof by StoreReady',
    profile: 'Local static release profile',
    demo: true,
    project: String(project).slice(0, 160),
    ref: String(ref).slice(0, 120),
    scannedAt,
    decision: decision.decision,
    readinessScore: score,
    summary: decision,
    checks,
    specialistJobs: statuses,
    findings,
    coverageGaps,
    limitations: ['Static file checks do not execute tests or builds and cannot establish runtime behavior.', 'The built-in secret rule can miss credentials and can produce false positives.', 'Dependency advisories are not queried when the local offline profile cannot establish advisory coverage.']
  };
}

export function releaseReportMarkdown(report) {
  if (!report || !Array.isArray(report.findings) || !Array.isArray(report.checks)) throw new Error('Invalid release report');
  const lines = [`# ${report.product} report`, '', `- Project: ${report.project}`, `- Ref: ${report.ref}`, `- Scanned: ${report.scannedAt}`, `- Profile: ${report.profile}`, `- Decision: ${report.decision}`, `- Readiness score: ${report.readinessScore}/100`, '', '## Checks', '', '| Category | Check | Status | Detail |', '| --- | --- | --- | --- |', ...report.checks.map(item => `| ${item.category} | ${item.title} | ${item.status} | ${item.detail.replaceAll('|', '\\|')} |`), '', '## Findings', ''];
  if (!report.findings.length) lines.push('No findings were generated by the checks in this profile.');
  for (const item of report.findings) lines.push(`### ${item.severity.toUpperCase()}: ${item.title}`, '', `${item.description} **Rule:** ${item.evidence.rule}. **Source:** ${item.evidence.scanner}${item.evidence.file ? ` at ${item.evidence.file}${item.evidence.line ? `:${item.evidence.line}` : ''}` : ''}.`, '', `**Why it matters:** ${item.whyItMatters}`, '', `**Remediation:** ${item.remediation}`, '');
  lines.push('## Coverage gaps', '', ...(report.coverageGaps.length ? report.coverageGaps.map(item => `- ${item.status}: ${item.reason}`) : ['- No coverage gaps recorded by this static profile.']), '', '## Limitations', '', ...report.limitations.map(item => `- ${item}`), '');
  return lines.join('\n');
}

export function releaseEvidenceHtml(report) {
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ReleaseProof evidence</title><style>body{font:16px/1.55 system-ui,sans-serif;max-width:980px;margin:48px auto;padding:0 24px;color:#17212b}header{border-bottom:1px solid #ccd4dc;padding-bottom:20px}h1{margin:0}.decision{font-size:1.5rem;font-weight:800;color:${report.decision === 'BLOCK' ? '#b3333d' : '#137456'}}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:10px;border-bottom:1px solid #dbe1e6}code{font-family:ui-monospace,monospace}</style><header><h1>${escape(report.product)}</h1><p>${escape(report.project)} · <code>${escape(report.ref)}</code></p><p class="decision">${escape(report.decision)} · ${report.readinessScore}/100</p><p>${escape(report.profile)} · ${escape(report.scannedAt)}</p></header><h2>Checks</h2><table><thead><tr><th>Category</th><th>Check</th><th>Status</th><th>Detail</th></tr></thead><tbody>${report.checks.map(item => `<tr><td>${escape(item.category)}</td><td>${escape(item.title)}</td><td>${escape(item.status)}</td><td>${escape(item.detail)}</td></tr>`).join('')}</tbody></table><h2>Findings</h2>${report.findings.map(item => `<article><h3>${escape(item.severity.toUpperCase())} · ${escape(item.title)}</h3><p>${escape(item.description)}</p><p><code>${escape(item.evidence.file || 'repository')}${item.evidence.line ? `:${item.evidence.line}` : ''}</code> · ${escape(item.evidence.rule)} · ${escape(item.evidence.scanner)}</p>${item.evidence.excerpt ? `<pre>${escape(item.evidence.excerpt)}</pre>` : ''}<p>${escape(item.remediation)}</p></article>`).join('') || '<p>No findings in this profile.</p>'}<h2>Coverage gaps</h2>${report.coverageGaps.map(item => `<p>${escape(item.status)} · ${escape(item.reason)}</p>`).join('') || '<p>None recorded.</p>'}<h2>Limitations</h2><ul>${report.limitations.map(item => `<li>${escape(item)}</li>`).join('')}</ul></html>`;
}

export const releaseProofLimits = Object.freeze({ maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES, ignoredDirectories: [...ignoredDirectories] });
