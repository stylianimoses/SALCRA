const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        processDir(fullPath);
      }
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Look for the class="sticky top-[64px] z-30 bg-white ... " in id="inpage-nav"
      // We will replace "sticky top-[64px] z-30 bg-white" with "bg-white"
      const target = 'class="sticky top-[64px] z-30 bg-white';
      const replacement = 'class="bg-white';
      
      if (content.includes(target)) {
        content = content.split(target).join(replacement);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Removed sticky in-page nav from: ${path.relative(rootDir, fullPath)}`);
      }
    }
  });
}

console.log("Starting removal of sticky top classes from inpage-nav...");
processDir(rootDir);
console.log("Sticky nav removal complete.");
