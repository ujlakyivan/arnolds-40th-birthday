# Fixing Paths for GitHub Pages

When hosting on GitHub Pages under a repository (not a custom domain), you need to fix all absolute paths in your code.

## Required Changes

### HTML Files

In all HTML files, change:
- `/styles/main.css` to `../styles/main.css` or `styles/main.css` (depending on file location)
- `/games/game-template.css` to `game-template.css` or `../game-template.css`
- Similar adjustments for script paths

### JavaScript Files

In your JS files that navigate between pages:
- Change `window.location.href = '/'` to `window.location.href = '../'` or adjust based on depth

## Automatic Path Correction

For convenience, here's a script you can run to update your paths before deploying:

```javascript
// place in /Users/ivan.ujlaky/a-birthday/tools/fix-paths.js
const fs = require('fs');
const path = require('path');

// Your GitHub repository name
const REPO_NAME = 'arnolds-40th-birthday'; 

// Function to recursively find files
function findFiles(dir, pattern, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, pattern, callback);
    } else if (pattern.test(file)) {
      callback(filePath);
    }
  });
}

// Process HTML files
findFiles('./Users/ivan.ujlaky/a-birthday', /\.(html|js)$/, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace absolute paths with repository-relative paths
  content = content.replace(/href=["']\/(?!\/)/g, `href="/${REPO_NAME}/`);
  content = content.replace(/src=["']\/(?!\/)/g, `src="/${REPO_NAME}/`);
  
  // Fix window.location paths in JS files
  content = content.replace(/window\.location\.href = ['"]\/['"]/g, 
                          `window.location.href = '/${REPO_NAME}/'`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated paths in: ${filePath}`);
});
```

Run with Node.js before pushing to GitHub.

## Alternative: Add a Base Tag

Instead of changing all paths, you could add a `<base>` tag to your HTML files:

```html
<head>
  <base href="https://yourusername.github.io/arnolds-40th-birthday/">
  <!-- other head content -->
</head>
```

This tells the browser to resolve all relative URLs using this base URL.
