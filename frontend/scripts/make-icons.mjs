import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BG_COLOR = '#12161f';

async function generateAllIcons() {
  const publicDir = path.resolve(__dirname, '../public');
  const backupDir = path.resolve(__dirname, '../_old-icons-backup');
  const sourceJpeg = path.join(publicDir, 'kriti.jpeg');

  if (!fs.existsSync(sourceJpeg)) {
    throw new Error(`Source image not found: ${sourceJpeg}`);
  }

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Loading source: ${sourceJpeg}`);
  const meta = await sharp(sourceJpeg).metadata();
  console.log(`Source dimensions: ${meta.width}x${meta.height}`);

  // Base square crop: bounds chosen to center heads and exclude all Kannada text below y=940
  // Left: 112, Top: 386, Width: 554, Height: 554
  const baseCrop = { left: 112, top: 386, width: 554, height: 554 };
  const tightCrop = { left: 140, top: 402, width: 498, height: 498 };

  // Save crop preview
  console.log('Generating crop-preview.png in backup directory...');
  await sharp(sourceJpeg)
    .extract(baseCrop)
    .png()
    .toFile(path.join(backupDir, 'crop-preview.png'));

  // 1. favicon-16x16.png (tighter crop, slight sharpen & contrast/brightness boost)
  console.log('Generating favicon-16x16.png...');
  const fav16Path = path.join(publicDir, 'favicon-16x16.png');
  await sharp(sourceJpeg)
    .extract(tightCrop)
    .modulate({ brightness: 1.25, saturation: 1.35 })
    .sharpen({ sigma: 1.2, m1: 2.0, m2: 1.0 })
    .resize(16, 16, { kernel: 'lanczos3' })
    .png()
    .toFile(fav16Path);

  // 2. favicon-32x32.png (tighter crop, slight sharpen & contrast/brightness boost)
  console.log('Generating favicon-32x32.png...');
  const fav32Path = path.join(publicDir, 'favicon-32x32.png');
  await sharp(sourceJpeg)
    .extract(tightCrop)
    .modulate({ brightness: 1.15, saturation: 1.25 })
    .sharpen({ sigma: 1.0, m1: 1.5, m2: 0.7 })
    .resize(32, 32, { kernel: 'lanczos3' })
    .png()
    .toFile(fav32Path);

  // 48x48 for ICO inclusion
  const fav48TempPath = path.join(backupDir, 'temp-48x48.png');
  await sharp(sourceJpeg)
    .extract(tightCrop)
    .modulate({ brightness: 1.1, saturation: 1.2 })
    .sharpen()
    .resize(48, 48, { kernel: 'lanczos3' })
    .png()
    .toFile(fav48TempPath);

  // 3. favicon.ico (combine 16, 32, 48 using png-to-ico)
  console.log('Generating favicon.ico (16, 32, 48)...');
  const icoBuf = await pngToIco([fav16Path, fav32Path, fav48TempPath]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  // 4. apple-touch-icon.png (180x180)
  console.log('Generating apple-touch-icon.png (180x180)...');
  await sharp(sourceJpeg)
    .extract(baseCrop)
    .resize(180, 180, { kernel: 'lanczos3' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. icon-192.png
  console.log('Generating icon-192.png (192x192)...');
  await sharp(sourceJpeg)
    .extract(baseCrop)
    .resize(192, 192, { kernel: 'lanczos3' })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 6. icon-512.png (512x512 downscaled from 554x554)
  console.log('Generating icon-512.png (512x512)...');
  await sharp(sourceJpeg)
    .extract(baseCrop)
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 7. icon-maskable-512.png (artwork inside central 80% safe zone, solid dark background)
  console.log('Generating icon-maskable-512.png (central 80% safe zone with seamless feathered blend)...');
  const maskableInnerSize = Math.round(512 * 0.80); // 410px
  const svgMask = Buffer.from(`
    <svg width="${maskableInnerSize}" height="${maskableInnerSize}">
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stop-color="#fff" stop-opacity="1" />
          <stop offset="98%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#fade)" />
    </svg>
  `);

  const artworkResized = await sharp(sourceJpeg)
    .extract(baseCrop)
    .resize(maskableInnerSize, maskableInnerSize, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const maskedArtwork = await sharp(artworkResized)
    .ensureAlpha()
    .composite([{ input: svgMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BG_COLOR
    }
  })
    .composite([{ input: maskedArtwork, gravity: 'center' }])
    .flatten({ background: BG_COLOR })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('All icons generated successfully!');
}

generateAllIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
