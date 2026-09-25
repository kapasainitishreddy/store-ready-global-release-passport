import { createReleaseProofServer } from './server.mjs';

const server = createReleaseProofServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const run = async variant => {
    const started = performance.now();
    const response = await fetch(`${base}/api/audit?variant=${variant}`);
    if (!response.ok) throw new Error(`Demo audit returned ${response.status}`);
    const { report } = await response.json();
    return { report, durationMs: Math.round(performance.now() - started) };
  };
  const broken = await run('broken');
  const fixed = await run('fixed');
  if (broken.report.decision !== 'BLOCK' || fixed.report.decision !== 'READY') throw new Error('Demo fixture did not reproduce the expected blocked-to-ready decisions');
  console.log(JSON.stringify({
    benchmark: 'ReleaseProof local static demo',
    measuredAt: new Date().toISOString(),
    checksPerformed: broken.report.checks.length + fixed.report.checks.length,
    broken: { decision: broken.report.decision, blockers: broken.report.summary.blockers, warnings: broken.report.summary.warnings, filesAnalyzed: broken.report.fileCount, auditDurationMs: broken.durationMs },
    fixed: { decision: fixed.report.decision, blockers: fixed.report.summary.blockers, warnings: fixed.report.summary.warnings, filesAnalyzed: fixed.report.fileCount, auditDurationMs: fixed.durationMs },
    fixesValidated: broken.report.summary.blockers > 0 && fixed.report.summary.blockers === 0,
    note: 'Timing is an observation from this local run, not a productivity claim. The static profile does not execute project commands.'
  }, null, 2));
} finally {
  await new Promise(resolve => server.close(resolve));
}
