const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const layoutPath = path.join(rootDir, 'master-template.html');
const indexHtmlPath = path.join(rootDir, 'index.html');

// 1. Generate master-template.html if it doesn't exist
if (!fs.existsSync(layoutPath)) {
  console.log("master-template.html not found. Generating from index.html...");
  if (!fs.existsSync(indexHtmlPath)) {
    console.error("Error: index.html not found. Cannot generate layout template.");
    process.exit(1);
  }
  
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const mainStartTag = '<main class="flex-grow">';
  const mainStart = indexHtml.indexOf(mainStartTag);
  if (mainStart === -1) {
    console.error("Error: Could not find '<main class=\"flex-grow\">' in index.html");
    process.exit(1);
  }
  
  const mainEndTag = '</main>';
  const mainEnd = indexHtml.indexOf(mainEndTag, mainStart + mainStartTag.length);
  if (mainEnd === -1) {
    console.error("Error: Could not find '</main>' in index.html");
    process.exit(1);
  }
  
  const prefix = indexHtml.substring(0, mainStart + mainStartTag.length);
  const suffix = indexHtml.substring(mainEnd);
  
  const templateHtml = prefix + '\n    <!-- CONTENT -->\n  ' + suffix;
  fs.writeFileSync(layoutPath, templateHtml, 'utf8');
  console.log("Successfully generated master-template.html.");
}

// Read the master layout template
const masterLayout = fs.readFileSync(layoutPath, 'utf8');

// Helper to adjust relative paths based on depth
function adjustPaths(content, depth) {
  if (depth === 0) return content;
  const prefix = '../'.repeat(depth);
  
  // 1. Adjust href="..." and src="..."
  let adjusted = content.replace(/(href|src)="([^"]+)"/g, (match, attr, val) => {
    // Skip external links, hashes, absolute links, mailto/tel links, and data uris
    if (val.startsWith('http') || val.startsWith('#') || val.startsWith('mailto:') || val.startsWith('tel:') || val.startsWith('data:')) {
      return match;
    }
    // Remove leading ./ if present
    const cleanVal = val.replace(/^\.\//, '');
    return `${attr}="${prefix}${cleanVal}"`;
  });
  
  // 2. Adjust url('...') or url("...") in style attributes or inline CSS
  adjusted = adjusted.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (match, val) => {
    if (val.startsWith('http') || val.startsWith('data:') || val.startsWith('#')) {
      return match;
    }
    const cleanVal = val.replace(/^\.\//, '');
    return `url('${prefix}${cleanVal}')`;
  });
  
  return adjusted;
}

// Extract Title and Main Content from an existing page
function extractPageData(html, filePath, relativePath) {
  let title = 'SALCRA';
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1];
  }
  
  let mainContent = '';
  // Extract content inside <main ...>...</main>
  const mainStart = html.indexOf('<main');
  if (mainStart !== -1) {
    const mainOpenEnd = html.indexOf('>', mainStart);
    const mainEnd = html.indexOf('</main>', mainOpenEnd);
    if (mainOpenEnd !== -1 && mainEnd !== -1) {
      mainContent = html.substring(mainOpenEnd + 1, mainEnd);
    }
  }
  
  return { title, mainContent };
}

// Generate Under Construction Placeholder content for empty pages
function generatePlaceholder(filename) {
  // E.g. "seed-garden.html" -> "Seed Garden"
  const baseName = path.basename(filename, '.html');
  const pageName = baseName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  const content = `
    <!-- Page Header -->
    <div class="relative max-w-[1520.8px] mx-auto h-[350px] overflow-hidden bg-gray-900 flex items-center justify-center mb-12">
      <img src="assets/images/banners/wisma.png" alt="Background" class="absolute inset-0 w-full h-full object-cover opacity-20">
      <div class="relative z-10 text-center px-4">
        <h1 class="text-4xl font-bold text-white mb-4">${pageName}</h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">This page is currently under construction. Check back soon for updates.</p>
      </div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="max-w-md mx-auto">
        <div class="w-20 h-20 bg-[#00A859]/10 text-[#00A859] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i data-feather="tool" class="w-10 h-10"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Section Under Construction</h2>
        <p class="text-gray-500 mb-8 font-light">We are working hard to bring you the content for this section. Please check back soon.</p>
        <a href="index.html" class="inline-flex items-center gap-2 bg-[#00A859] hover:bg-[#F2A900] text-white hover:text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-green-700/20">
          <i data-feather="arrow-left" class="w-4 h-4"></i> Back to Homepage
        </a>
      </div>
    </div>
  `;
  
  return {
    title: `${pageName} - SALCRA`,
    mainContent: content
  };
}

// Process a single HTML file
function processHtmlFile(filePath) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  
  // Skip master-template itself
  if (relativePath === 'master-template.html') return;
  
  const depth = relativePath.split('/').length - 1;
  const size = fs.statSync(filePath).size;
  
  let pageTitle = '';
  let mainContent = '';
  
  if (size > 50) { // Existing implementation
    const fileHtml = fs.readFileSync(filePath, 'utf8');
    const pageData = extractPageData(fileHtml, filePath, relativePath);
    pageTitle = pageData.title;
    mainContent = pageData.mainContent;
    
    // Check if we failed to parse main content
    if (!mainContent || mainContent.trim() === '') {
      console.warn(`Warning: Could not extract main content for ${relativePath}. Skipping.`);
      return;
    }
  } else { // Empty placeholder page
    const placeholder = generatePlaceholder(filePath);
    pageTitle = placeholder.title;
    mainContent = placeholder.mainContent;
    console.log(`Generating placeholder for empty file: ${relativePath}`);
  }
  
  // Inject into layout template
  let pageHtml = masterLayout;
  
  // 1. Replace title tag
  pageHtml = pageHtml.replace(/<title>[^<]*<\/title>/i, `<title>${pageTitle}</title>`);
  
  // 2. Adjust paths in layout template relative to depth before inserting content
  pageHtml = adjustPaths(pageHtml, depth);
  
  // 3. If it was an empty placeholder page, adjust paths in mainContent relative to depth
  if (size <= 50) {
    mainContent = adjustPaths(mainContent, depth);
  }
  
  // 4. Replace content inside <main class="flex-grow">
  const mainPlaceholder = '<!-- CONTENT -->';
  const placeholderIndex = pageHtml.indexOf(mainPlaceholder);
  if (placeholderIndex === -1) {
    console.error("Error: Could not find '<!-- CONTENT -->' in layout template.");
    process.exit(1);
  }
  
  pageHtml = pageHtml.replace(mainPlaceholder, mainContent);
  
  // Save page
  fs.writeFileSync(filePath, pageHtml, 'utf8');
  console.log(`Processed: ${relativePath} (depth: ${depth})`);
}

// Scan directories and subdirectories
function scanAndProcess(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const baseDir = path.basename(fullPath);
      // Skip node_modules and hidden folders
      if (baseDir !== 'node_modules' && !baseDir.startsWith('.')) {
        scanAndProcess(fullPath);
      }
    } else {
      if (file.endsWith('.html')) {
        processHtmlFile(fullPath);
      }
    }
  });
}

// Start processing
console.log("Starting layout synchronization across all HTML files...");
scanAndProcess(rootDir);
console.log("Layout synchronization complete.");
