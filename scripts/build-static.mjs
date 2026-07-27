import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/web');
const target = resolve(root, 'dist');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

await writeFile(
  resolve(target, 'deployment.json'),
  `${JSON.stringify({ app: 'rendezvue', target: 'huggingface-static-space', version: '0.1.0-alpha.1' }, null, 2)}\n`,
  'utf8',
);

console.log('Static Space build written to dist/.');
