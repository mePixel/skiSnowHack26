import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

const svgPath = path.join(__dirname, '../public/ski-icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Error generating icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);