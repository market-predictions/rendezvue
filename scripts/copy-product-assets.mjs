import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'synthetic-seed', 'portraits');
const target = resolve(root, 'dist-private-preview', 'assets', 'profiles');
const names = Object.freeze([
  'yasmin', 'bilal', 'amina', 'idris', 'maryam',
  'samir', 'noura', 'youssef', 'hafsa', 'omar'
]);

await mkdir(target, { recursive: true });

for (const name of names) {
  const sourcePath = resolve(source, `${name}.webp`);
  const targetPath = resolve(target, `${name}.webp`);
  const bytes = await readFile(sourcePath);
  if (bytes.length < 1000) throw new Error(`Synthetic portrait is unexpectedly small: ${name}.webp`);
  await copyFile(sourcePath, targetPath);
}

await writeFile(
  resolve(target, 'manifest.json'),
  `${JSON.stringify({ syntheticOnly: true, count: names.length, names }, null, 2)}\n`,
  'utf8'
);

console.log(`Copied ${names.length} synthetic profile portraits into the Cloudflare artifact.`);