/**
 * This script helps remove dark mode related classes and declarations 
 * from component files during the build process.
 */
const fs = require('fs');
const path = require('path');

// Directories to scan
const DIRS_TO_SCAN = [
  './app',
  './components',
  './lib'
];

// Patterns to remove or replace
const REPLACEMENTS = [
  // Remove dark mode classes
  { pattern: /dark:([\w-]+)/g, replacement: '' },
  { pattern: /class="([^"]*)dark:[^"]*"/g, replacement: (match, p1) => `class="${p1.trim()}"` },
  { pattern: /className="([^"]*)dark:[^"]*"/g, replacement: (match, p1) => `className="${p1.trim()}"` },
  
  // Clean up resulting artifacts
  { pattern: /\s+"/g, replacement: '"' },
  { pattern: /"\s+/g, replacement: '" ' },
  { pattern: /\s{2,}/g, replacement: ' ' }
];

/**
 * Recursively scan directories for JavaScript and TypeScript files
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath);
    } else if (
      file.name.endsWith('.js') || 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.ts') || 
      file.name.endsWith('.tsx')
    ) {
      processFile(fullPath);
    }
  });
}

/**
 * Process file to remove or replace dark mode patterns
 */
function processFile(filePath) {
  if (
    filePath.includes('ThemeProvider') || 
    filePath.includes('ThemeToggle') || 
    filePath.includes('ThemeScript')
  ) {
    console.log(`Skipping theme-related file: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply replacements
    REPLACEMENTS.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main execution
console.log('Starting theme cleanup...');
DIRS_TO_SCAN.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
});
console.log('Theme cleanup complete!');