import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanReleaseProofFiles, evaluateReleaseDecision, releaseReportMarkdown, releaseEvidenceHtml } from '../src/engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../examples/releaseproof');
async function readFixture(variant) {
  const base = path.join(root, `${variant}-app`);
  const rows = [];
  async function visit(directory) {
    for (const item of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, item.name);
      if (item.isSymbolicLink()) throw new Error('Unexpected symlink in fixture');
      if (item.isDirectory()) await visit(full);
      else rows.push({ path: path.relative(base, full).replaceAll(path.sep, '/'), content: await fs.readFile(full, 'utf8') });
    }
  }
  await visit(base);
  return rows;
}

test('broken demo emits source-backed blockers and redacts credential-shaped evidence', async () => {
  const report = scanReleaseProofFiles(await readFixture('broken'), { project: 'broken-app', ref: 'fixture' });
  assert.equal(report.decision, 'BLOCK');
  assert.ok(report.findings.some(item => item.evidence.rule === 'hardcoded-credential-pattern' && item.evidence.file === 'src/config.mjs' && item.evidence.line === 2));
  assert.ok(report.findings.some(item => item.evidence.rule === 'test-configuration'));
  assert.ok(report.findings.every(item => !item.evidence.excerpt?.includes('DEMO_ONLY_REPLACE_ME')));
});

test('fixed demo clears blockers while configured checks remain explicitly static', async () => {
  const report = scanReleaseProofFiles(await readFixture('fixed'), { project: 'fixed-app', ref: 'fixture' });
  assert.equal(report.decision, 'READY');
  assert.equal(report.summary.blockers, 0);
  assert.equal(report.summary.warnings, 0);
  assert.ok(report.checks.some(item => item.id === 'tests' && item.status === 'PASS' && /does not execute/.test(item.detail)));
  assert.equal(report.checks.find(item => item.id === 'test-execution').status, 'NOT_RUN');
  assert.equal(report.specialistJobs.find(item => item.name === 'Testing').status, 'REVIEW');
  assert.ok(report.checks.some(item => item.id === 'mobile-store' && item.status === 'NOT_APPLICABLE'));
  assert.equal(report.coverageGaps.length, 0);
});

test('release gate blocks unresolved high severity findings and failed required checks', () => {
  const high = { title: 'Secret', severity: 'high', status: 'open' };
  assert.equal(evaluateReleaseDecision({ findings: [high] }).decision, 'BLOCK');
  assert.equal(evaluateReleaseDecision({ checks: [{ title: 'Tests', status: 'FAIL' }] }).decision, 'BLOCK');
  assert.equal(evaluateReleaseDecision({ findings: [{ ...high, status: 'fixed' }] }).decision, 'READY');
});

test('scanner rejects path traversal, duplicate paths, malformed input and oversized files', () => {
  assert.throws(() => scanReleaseProofFiles([{ path: '../secret', content: 'x' }]), /Unsafe|Invalid/);
  assert.throws(() => scanReleaseProofFiles([{ path: 'a.js', content: 'x' }, { path: 'a.js', content: 'y' }]), /Duplicate/);
  assert.throws(() => scanReleaseProofFiles({}), /file limit/);
  assert.throws(() => scanReleaseProofFiles([{ path: 'large.js', content: 'x'.repeat(300_000) }]), /size limit/);
});

test('coverage gaps are reported separately and do not become PASS checks', () => {
  const report = scanReleaseProofFiles([{ path: 'package.json', content: JSON.stringify({ scripts: { test: 'node --test' }, dependencies: { example: '^1.0.0' } }) }, { path: 'tests/a.test.js', content: 'test("x", () => {});' }]);
  assert.equal(report.coverageGaps[0].status, 'Coverage unavailable');
  assert.equal(report.checks.find(item => item.id === 'dependencies').status, 'WARNING');
  assert.equal(report.decision, 'REVIEW');
});

test('report exports escape untrusted project and excerpt text', () => {
  const report = scanReleaseProofFiles([{ path: 'package.json', content: '{"scripts":{"test":"node --test"}}' }, { path: 'src/a.js', content: "const API_TOKEN = '<img src=x onerror=alert(1)>';" }], { project: '<script>alert(1)</script>' });
  assert.ok(releaseReportMarkdown(report).includes('<script>alert(1)</script>'));
  assert.ok(!releaseEvidenceHtml(report).includes('<script>alert(1)</script>'));
  assert.ok(!releaseEvidenceHtml(report).includes('<img src=x'));
});
