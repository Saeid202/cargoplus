import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SVG = path.resolve('public/logo-icon.svg');
const OUT = path.resolve('public/icons');

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  // icon-192.png
  await sharp(SVG).resize(192, 192).png().toFile(path.join(OUT, 'icon-192.png'));
  console.log('✓ icon-192.png');

  // icon-512.png
  await sharp(SVG).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));
  console.log('✓ icon-512.png');

  // icon-maskable.png — logo at 80% centred on #4B1D8F background
  const logoSize = Math.round(512 * 0.8); // 410px
  const offset = Math.round((512 - logoSize) / 2); // 51px
  const logoBuffer = await sharp(SVG).resize(logoSize, logoSize).png().toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 75, g: 29, b: 143, alpha: 1 } },
  })
    .composite([{ input: logoBuffer, top: offset, left: offset }])
    .png()
    .toFile(path.join(OUT, 'icon-maskable.png'));
  console.log('✓ icon-maskable.png');

  console.log('\nAll icons generated in public/icons/');
}

main().catch((err) => { console.error(err); process.exit(1); });
