/**
 * Generate placeholder assets for Expo app
 */
const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// App primary color
const primaryColor = '#007AFF';
const backgroundColor = '#ffffff';

async function generateIcon(size, outputPath) {
  // Create a simple icon with "P" letter
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${primaryColor}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="${backgroundColor}">
        P
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateSplash(width, height, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="${primaryColor}">
        Planwise
      </text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="36" fill="#666666">
        目標達成をサポート
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateFavicon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${primaryColor}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="${size * 0.7}" font-weight="bold" fill="${backgroundColor}">
        P
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  try {
    // Make sure assets directory exists
    const fs = require('fs');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Generate app icon (1024x1024)
    await generateIcon(1024, path.join(assetsDir, 'icon.png'));
    
    // Generate adaptive icon for Android (1024x1024)
    await generateIcon(1024, path.join(assetsDir, 'adaptive-icon.png'));
    
    // Generate splash screen (1242x2688 for iPhone)
    await generateSplash(1242, 2688, path.join(assetsDir, 'splash.png'));
    
    // Generate favicon (48x48)
    await generateFavicon(48, path.join(assetsDir, 'favicon.png'));
    
    console.log('\nAll assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main();
