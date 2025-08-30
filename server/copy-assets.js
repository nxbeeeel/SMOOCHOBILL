const fs = require('fs');
const path = require('path');

// Ensure dist/database directory exists
const distDbPath = path.join(__dirname, 'dist', 'database');
if (!fs.existsSync(distDbPath)) {
  fs.mkdirSync(distDbPath, { recursive: true });
}

// Copy SQL files
const srcDbPath = path.join(__dirname, 'src', 'database');
const files = fs.readdirSync(srcDbPath);

files.forEach(file => {
  if (file.endsWith('.sql') || file.endsWith('.db')) {
    const srcFile = path.join(srcDbPath, file);
    const destFile = path.join(distDbPath, file);
    
    try {
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied: ${file}`);
    } catch (err) {
      console.log(`Skipped: ${file} (${err.message})`);
    }
  }
});

console.log('Assets copied successfully!');
