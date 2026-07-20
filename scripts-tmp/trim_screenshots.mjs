import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('docs/client-guide/screenshots');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.png'));

for (const f of files) {
  const p = path.join(DIR, f);
  const input = fs.readFileSync(p);
  const before = await sharp(input).metadata();
  try {
    const output = await sharp(input).trim({ threshold: 12 }).png().toBuffer();
    const after = await sharp(output).metadata();
    fs.writeFileSync(p, output);
    console.log(f, `${before.width}x${before.height} -> ${after.width}x${after.height}`);
  } catch (e) {
    console.log(f, 'SKIP (trim failed):', e.message);
  }
}
console.log('done');
