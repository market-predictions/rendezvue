import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { applyPrivacyFilterGrid } from './apply-filter-grid.mjs';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/web');
const target = resolve(root, 'dist');

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
await applyPrivacyFilterGrid(target);

await writeFile(
  resolve(target, 'deployment.json'),
  `${JSON.stringify({ app: 'rendezvue', market: 'netherlands', audience: 'muslim-students-18-plus', education: ['mbo', 'hbo', 'wo'], languages: ['nl', 'en'], target: 'huggingface-static-space', version: '0.2.0-alpha.3', avatarMode: 'browser-local-filter-grid' }, null, 2)}\n`,
  'utf8'
);

console.log('Static Space build written to dist/.');
