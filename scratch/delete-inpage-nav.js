const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function removeInpageNav(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(rootDir, filePath);
  
  let hasChanged = false;
  
  // Outer loop in case of multiple instances (though usually only one)
  while (true) {
    const startIndex = content.indexOf('<div id="inpage-nav"');
    if (startIndex === -1) break;
    
    let openDivs = 0;
    let currentIndex = startIndex;
    let foundEnd = false;
    let endIndex = -1;
    
    while (currentIndex < content.length) {
      if (content.substr(currentIndex, 4) === '<div') {
        openDivs++;
        currentIndex += 4;
      } else if (content.substr(currentIndex, 5) === '</div') {
        openDivs--;
        currentIndex += 5;
        if (openDivs === 0) {
          endIndex = content.indexOf('>', currentIndex) + 1;
          foundEnd = true;
          break;
        }
      } else {
        currentIndex++;
      }
    }
    
    if (foundEnd && endIndex !== -1) {
      // Find comment prefix before the div to remove the comment title block too
      let blockStart = startIndex;
      const searchStart = Math.max(0, startIndex - 150);
      const preText = content.substring(searchStart, startIndex);
      const commentIndex = preText.lastIndexOf('<!--');
      if (commentIndex !== -1) {
        blockStart = searchStart + commentIndex;
      }
      
      // Remove any leading/trailing blank lines/spaces created by deletion
      content = content.substring(0, blockStart).replace(/\r?\n\s*$/, '\n') + content.substring(endIndex);
      hasChanged = true;
    } else {
      console.error(`Error: Found inpage-nav but could not locate matching closing tag in ${relativePath}`);
      break;
    }
  }
  
  if (hasChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully deleted inpage-nav block from: ${relativePath}`);
  }
}

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
      removeInpageNav(fullPath);
    }
  });
}

console.log("Scanning files to delete in-page section navigator blocks...");
processDir(rootDir);
console.log("In-page section navigator removal complete.");
