# Fixing Navigation Issues on GitHub Pages

When deploying to GitHub Pages, navigation issues can occur because your site is hosted at a subdirectory (e.g., `username.github.io/repository-name/`) rather than at the root domain.

## Common Navigation Issues

### Back Button Goes to Wrong URL

**Problem:** Clicking the back button in game pages navigates to `https://username.github.io/index.html` instead of `https://username.github.io/repository-name/index.html`.

**Solution:** Update the back button navigation code in `games/game-template.js`:

```javascript
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
        window.location.href = `${baseUrl}/index.html`;
    } else {
        // Fallback to relative navigation if path structure is different
        const baseTag = document.querySelector('base');
        if (baseTag && baseTag.href) {
            window.location.href = new URL('index.html', baseTag.href).href;
        } else {
            window.location.href = '../../index.html';
        }
    }
});
```

### Incorrect Base Tags

**Problem:** Base tags are incorrect or missing, causing relative paths to resolve incorrectly.

**Solution:** 

1. For main `index.html`:
```html
<base href="./">
```

2. For game pages:
```html
<base href="../../">
```

## Testing Navigation

Use the utility at `/util/navigation-check.html` to:

1. View current URL information
2. Test navigation paths
3. Get the correct code for fixing navigation issues

## Manual Fixes

To apply fixes manually:

1. Run the `fix-navigation.js` script:
```bash
node fix-navigation.js
```

2. Verify that base tags are correctly set in all HTML files:
```bash
# For main index.html
sed -i '' 's|<head>|<head>\n  <base href="./">|' index.html

# For game pages
find ./games -name "index.html" -type f | while read file; do
  if ! grep -q "<base href=" "$file"; then
    sed -i '' 's|<head>|<head>\n  <base href="../../">|' "$file"
  fi
done
```

3. Validate your navigation by testing all back buttons and page links after deployment
