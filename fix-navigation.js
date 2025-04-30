/**
 * This script fixes navigation issues in the game template file
 * Run with: node fix-navigation.js
 */

const fs = require('fs');
const path = require('path');

// Path to the game template file
const templateFile = path.join(__dirname, 'games', 'game-template.js');

// New back button navigation code
const newBackButtonCode = `
    // Handle back button click with fixed navigation for GitHub Pages
    backButton.addEventListener('click', () => {
        // Get repository name from the current URL
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        
        // Find the index of 'games' in the path
        const gamesIndex = urlParts.findIndex(part => part === 'games');
        
        // Create the correct base URL by removing game-specific parts
        if (gamesIndex > 0) {
            // Go up two levels from the game directory
            const baseUrl = urlParts.slice(0, gamesIndex).join('/');
            window.location.href = \`\${baseUrl}/index.html\`;
        } else {
            // Fallback to relative navigation if path structure is different
            const baseTag = document.querySelector('base');
            if (baseTag && baseTag.href) {
                window.location.href = new URL('index.html', baseTag.href).href;
            } else {
                window.location.href = '../../index.html';
            }
        }
    });`;

// Read the template file
console.log(`Reading template file: ${templateFile}`);
fs.readFile(templateFile, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
    }
    
    // Replace the back button navigation logic
    const updatedContent = data.replace(
        /backButton\.addEventListener\('click',[^}]+\}\);/s,
        newBackButtonCode
    );
    
    // Write the updated file
    fs.writeFile(templateFile, updatedContent, 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file: ${err.message}`);
            return;
        }
        console.log(`Successfully updated navigation in ${templateFile}`);
    });
});

console.log('Checking individual game files for inline navigation code...');
// Also check individual game files for inline navigation code
const gamesDir = path.join(__dirname, 'games');
fs.readdir(gamesDir, (err, files) => {
    if (err) {
        console.error(`Error reading games directory: ${err.message}`);
        return;
    }
    
    files.forEach(file => {
        const gamePath = path.join(gamesDir, file);
        if (fs.statSync(gamePath).isDirectory() && file !== 'node_modules') {
            // Check for script.js in each game directory
            const scriptFile = path.join(gamePath, 'script.js');
            if (fs.existsSync(scriptFile)) {
                fs.readFile(scriptFile, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading ${scriptFile}: ${err.message}`);
                        return;
                    }
                    
                    // Check if there's any custom back button logic
                    if (data.includes('backButton') && data.includes('addEventListener') && data.includes('window.location')) {
                        console.log(`Found custom navigation in ${scriptFile}, updating...`);
                        const updatedContent = data.replace(
                            /backButton\.addEventListener\('click',[^}]+\}\);/s,
                            newBackButtonCode
                        );
                        
                        fs.writeFile(scriptFile, updatedContent, 'utf8', (err) => {
                            if (err) {
                                console.error(`Error updating ${scriptFile}: ${err.message}`);
                                return;
                            }
                            console.log(`Successfully updated navigation in ${scriptFile}`);
                        });
                    }
                });
            }
        }
    });
});
