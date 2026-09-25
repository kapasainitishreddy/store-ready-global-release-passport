import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditFixture } from './server.mjs';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(appRoot, 'public', 'demo-reports');
await fs.mkdir(outputDir, { recursive: true });
for (const variant of ['broken', 'fixed']) {
  const payload = await auditFixture(variant);
  await fs.writeFile(path.join(outputDir, `${variant}.json`), `${JSON.stringify(payload, null, 2)}\n`);
}
console.log(`Wrote scanner-derived static snapshots to ${outputDir}`);
