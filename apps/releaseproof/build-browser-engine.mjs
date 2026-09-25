import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, 'src', 'engine.mjs');
const output = path.join(root, 'public', 'scanner-engine.js');
const code = await fs.readFile(source, 'utf8');
if (/from ['"]node:|\bBuffer\.byteLength\b/.test(code)) throw new Error('The scanner engine must stay browser compatible.');
await fs.writeFile(output, code);
console.log(JSON.stringify({ output: 'public/scanner-engine.js', bytes: Buffer.byteLength(code) }));
