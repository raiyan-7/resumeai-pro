const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'frontend', 'dist');
const dest = path.join(__dirname, 'dist');

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(src)) {
  console.log(`Copying built files from ${src} to ${dest}...`);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDir(src, dest);
  console.log('Static files successfully replicated to project root dist/ folder!');
} else {
  console.error(`Source directory ${src} does not exist! Make sure to run frontend build first.`);
  process.exit(1);
}
