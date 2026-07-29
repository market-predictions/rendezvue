import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(process.cwd()); const built = resolve(root, 'dist'); const target = resolve(root, '.hf-deploy'); const metadata = resolve(root, 'infrastructure/huggingface/README.static.md');
await access(resolve(built, 'index.html')); await access(metadata); await rm(target, { recursive: true, force: true }); await mkdir(target, { recursive: true }); await cp(built, target, { recursive: true }); await cp(metadata, resolve(target, 'README.md'));
await writeFile(resolve(target, 'source.json'), `${JSON.stringify({ source: 'github:market-predictions/rendezvue', authority: 'github-main', target: 'huggingface-static-space-prebuilt', generatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
console.log('Prebuilt Hugging Face deployment written to .hf-deploy/.');
