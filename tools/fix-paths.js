/**
 * Path fixing script for GitHub Pages deployment
 * 
 * This script automatically fixes paths in HTML, CSS and JS files
 * to work correctly when deployed to GitHub Pages.
 * 
 * Run with: node tools/fix-paths.js
 */

const fs = require('fs');
const path = require('path');

// Repository name - Update this to your actual repository name when you create the repo
const REPO_NAME = 'a-birthday';

// Files to process
const fileTypes = ['.html', '.css', '.js'];

// Directories to skip
const skipDirs = ['.git', 'node_modules', '.github'];

// Function to recursively find files
function findFiles(dir, callback) {
  if (skipDirs.some(skipDir => dir.includes(skipDir))) {
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, callback);
    } else if (fileTypes.some(type => file.endsWith(type))) {
      callback(filePath);
    }
  }
}

// Process a file to fix paths
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // HTML files need href and src attributes fixed
  if (filePath.endsWith('.html')) {
    const originalContent = content;
    
    // Fix absolute paths in href attributes
    content = content.replace(
      /href=["']\/(?!\/|http|https)([^"']*)["']/g, 
      (match, p1) => `href="./${p1}"`
    );
    
    // Fix absolute paths in src attributes
    content = content.replace(
      /src=["']\/(?!\/|http|https)([^"']*)["']/g, 
      (match, p1) => `src="./${p1}"`
    );
    
    modified = content !== originalContent;
  }
  
  // JS files need window.location paths fixed
  if (filePath.endsWith('.js')) {
    const originalContent = content;
    
    // Fix window.location paths
    content = content.replace(
      /window\.location\.href\s*=\s*['"]\/['"]/g,
      `window.location.href = './index.html'`
    );
    
    content = content.replace(
      /window\.location\.href\s*=\s*['"]\/([^'"]+)['"]/g,
      (match, p1) => `window.location.href = './${p1}'`
    );
    
    modified = content !== originalContent;
  }
  
  // Save the file if it was modified
  if (modified) {
    console.log(`  Fixed paths in: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Find and process all applicable files
console.log('Starting path fixing for GitHub Pages deployment...');
findFiles('.', processFile);
console.log('Path fixing completed!');
