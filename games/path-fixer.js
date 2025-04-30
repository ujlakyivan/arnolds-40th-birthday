/**
 * This script updates all game HTML files with correct paths and base tags
 * Run with: node path-fixer.js
 */

const fs = require('fs');
const path = require('path');

const GAMES_DIR = __dirname;
const gameDirectories = fs.readdirSync(GAMES_DIR).filter(file => {
    const fullPath = path.join(GAMES_DIR, file);
    return fs.statSync(fullPath).isDirectory() && file !== 'node_modules';
});

console.log(`Found ${gameDirectories.length} game directories to process`);

gameDirectories.forEach(gameDir => {
    const htmlPath = path.join(GAMES_DIR, gameDir, 'index.html');
    
    if (fs.existsSync(htmlPath)) {
        console.log(`Processing ${htmlPath}`);
        
        let content = fs.readFileSync(htmlPath, 'utf8');
        
        // Add or update the base tag
        if (content.includes('<base href=')) {
            content = content.replace(
                /<base href=["'][^"']*["']/g, 
                '<base href="../../"'
            );
        } else if (content.includes('<head>')) {
            content = content.replace(
                '<head>', 
                '<head>\n    <base href="../../">'
            );
        }
        
        // Fix resource paths
        content = content.replace(
            /href=["']\/styles\//g, 
            'href="styles/'
        );
        
        content = content.replace(
            /href=["']\/games\//g, 
            'href="games/'
        );
        
        content = content.replace(
            /src=["']\/games\//g, 
            'src="games/'
        );
        
        content = content.replace(
            /href=["']style.css["']/g, 
            'href="games/' + gameDir + '/style.css"'
        );
        
        content = content.replace(
            /src=["']script.js["']/g, 
            'src="games/' + gameDir + '/script.js"'
        );
        
        fs.writeFileSync(htmlPath, content);
        console.log(`Updated ${htmlPath}`);
    }
});

console.log('Path fixing completed!');
