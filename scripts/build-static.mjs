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
  `${JSON.stringify({
    app: 'rendezvue-concept-artifact',
    market: 'netherlands',
    audience: 'adult-muslim-community-student-first',
    education: ['mbo', 'hbo', 'wo'],
    lifeStages: ['student', 'recentGraduate', 'employed', 'selfEmployed', 'jobSeeking', 'other'],
    languages: ['nl', 'en'],
    target: 'repository-static-artifact',
    canonicalHosting: false,
    version: '0.4.0-alpha.2',
    portraitMode: 'browser-local-privacy-filter-grid',
    interactionMode: 'local-concept-pilot'
  }, null, 2)}\n`,
  'utf8'
);
console.log('Non-canonical concept artifact written to dist/.');
