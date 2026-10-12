const path = require('path');
const fs = require('fs');
const sharp = require('./frontend/node_modules/sharp');
const toIco = require('./frontend/node_modules/to-ico');

async function generateIcons() {
  const sourcePath = path.resolve(__dirname, 'frontend/public/kritiLogo.png');
  const publicDir = path.resolve(__dirname, 'frontend/public');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source logo file does not exist at:', sourcePath);
    process.exit(1);
  }

  console.log('Reading source image from:', sourcePath);

  // 1. favicon-32x32.png
  console.log('Generating favicon-32x32.png...');
  await sharp(sourcePath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 2. favicon.ico with (16, 32, 48)
  console.log('Generating favicon.ico (16, 32, 48)...');
  const buf16 = await sharp(sourcePath)
    .resize(16, 16, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const buf32 = await sharp(sourcePath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const buf48 = await sharp(sourcePath)
    .resize(48, 48, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const icoBuffer = await toIco([buf16, buf32, buf48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // 3. apple-touch-icon.png (180x180, solid dark background #0f0f14 behind the logo, logo centered with ~12% padding, no transparency)
  console.log('Generating apple-touch-icon.png (180x180, #0f0f14, ~12% padding)...');
  const appleInnerSize = Math.round(180 * (1 - 2 * 0.12)); // ~137px
  const appleLogoBuf = await sharp(sourcePath)
    .resize(appleInnerSize, appleInnerSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: '#0f0f14'
    }
  })
    .composite([{ input: appleLogoBuf, gravity: 'center' }])
    .flatten({ background: '#0f0f14' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. icon-192.png and icon-512.png (logo centered, keep proportions)
  console.log('Generating icon-192.png...');
  await sharp(sourcePath)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Generating icon-512.png...');
  await sharp(sourcePath)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 5. icon-maskable-512.png (logo within central 80% safe zone, solid background)
  console.log('Generating icon-maskable-512.png (512x512, central 80% safe zone, #0f0f14)...');
  const maskableInnerSize = Math.round(512 * 0.80); // ~410px
  const maskableLogoBuf = await sharp(sourcePath)
    .resize(maskableInnerSize, maskableInnerSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: '#0f0f14'
    }
  })
    .composite([{ input: maskableLogoBuf, gravity: 'center' }])
    .flatten({ background: '#0f0f14' })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
