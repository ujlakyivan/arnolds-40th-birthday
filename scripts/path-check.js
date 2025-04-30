/**
 * Path Checker Utility
 * 
 * This script helps identify potential path issues in your HTML files.
 * It prints a report of all resource references and flags potentially problematic paths.
 * 
 * Usage: node path-check.js
 */

const fs = require('fs');
const path = require('path');

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      if (!['node_modules', '.git', '.github'].includes(file)) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extract resource paths from HTML
function extractResourcePaths(htmlContent, filePath) {
  const resources = [];
  
  // Find href attributes
  const hrefMatches = htmlContent.match(/href=["']([^"']+)["']/g) || [];
  hrefMatches.forEach(match => {
    const hrefPath = match.match(/href=["']([^"']+)["']/)[1];
    if (!hrefPath.startsWith('http') && !hrefPath.startsWith('#') && !hrefPath.startsWith('mailto:')) {
      resources.push({
        type: 'href',
        path: hrefPath,
        isAbsolute: hrefPath.startsWith('/'),
        isPotentiallyProblematic: hrefPath.startsWith('/') || hrefPath.startsWith('..')
      });
    }
  });
  
  // Find src attributes
  const srcMatches = htmlContent.match(/src=["']([^"']+)["']/g) || [];
  srcMatches.forEach(match => {
    const srcPath = match.match(/src=["']([^"']+)["']/)[1];
    if (!srcPath.startsWith('http')) {
      resources.push({
        type: 'src',
        path: srcPath,
        isAbsolute: srcPath.startsWith('/'),
        isPotentiallyProblematic: srcPath.startsWith('/') || srcPath.startsWith('..')
      });
    }
  });
  
  // Check for base tag
  const hasBaseTag = htmlContent.includes('<base href=');
  
  return {
    resources,
    hasBaseTag,
    containingDirectory: path.dirname(filePath)
  };
}

// Check if a file exists
function fileExists(basePath, resourcePath) {
  // Resolve absolute paths relative to project root
  if (resourcePath.startsWith('/')) {
    resourcePath = resourcePath.substring(1);
    basePath = '.';
  }
  
  const fullPath = path.join(basePath, resourcePath);
  return fs.existsSync(fullPath);
}

// Main function
function checkPaths() {
  console.log('Scanning for HTML files...');
  const htmlFiles = findHtmlFiles('.');
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  let problemsFound = 0;
  
  htmlFiles.forEach(file => {
    console.log(`\nChecking ${file}:`);
    const htmlContent = fs.readFileSync(file, 'utf8');
    const { resources, hasBaseTag, containingDirectory } = extractResourcePaths(htmlContent, file);
    
    console.log(`- Base tag: ${hasBaseTag ? 'Present' : 'Missing'}`);
    console.log(`- Found ${resources.length} resources`);
    
    // Check for problematic paths
    const problematicPaths = resources.filter(resource => resource.isPotentiallyProblematic);
    if (problematicPaths.length > 0) {
      console.log('- Potentially problematic paths:');
      problematicPaths.forEach(resource => {
        const exists = fileExists(containingDirectory, resource.path);
        console.log(`  - ${resource.path} (${resource.type}): ${exists ? 'File exists' : 'FILE NOT FOUND'}`);
        if (!exists) problemsFound++;
      });
    }
    
    // Summary for this file
    if (problematicPaths.length === 0) {
      console.log('- No problematic paths found');
    }
    
    // Additional checks
    if (!hasBaseTag) {
      const isGamePage = file.includes('/games/') && !file.includes('game-template');
      console.log(`- RECOMMENDATION: Add <base href="${isGamePage ? '../../' : './'}">`);
    }
  });
  
  // Overall summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total HTML files checked: ${htmlFiles.length}`);
  console.log(`Potential resource problems found: ${problemsFound}`);
  console.log(problemsFound > 0 ? 'Fix the issues above to resolve 404 errors' : 'No critical path issues detected');
}

checkPaths();
