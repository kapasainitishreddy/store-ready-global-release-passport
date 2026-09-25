import test from 'node:test';
import assert from 'node:assert/strict';
import { createReleaseProofServer } from '../server.mjs';

test('demo API scans only named fixtures and keeps scanner coverage distinct', async () => {
  const server = createReleaseProofServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('x-frame-options'), 'DENY');
    const blocked = await fetch(`${base}/api/audit?variant=broken`);
    const payload = await blocked.json();
    assert.equal(payload.report.decision, 'BLOCK');
    assert.equal(payload.report.demo, true);
    assert.ok(payload.markdown.includes('## Coverage gaps'));
    const invalid = await fetch(`${base}/api/audit?variant=..%2F..%2FREADME.md`);
    assert.equal(invalid.status, 400);
    const arbitraryFile = await fetch(`${base}/README.md`);
    assert.equal(arbitraryFile.status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
