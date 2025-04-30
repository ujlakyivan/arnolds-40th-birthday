# Arnold's 40th Birthday Game App

A lightweight mobile-optimized web application featuring 10 mini-games to celebrate Arnold's 40th birthday.

## Features
- Mobile-first responsive design
- Basic authentication
- 2x5 grid of mini-games
- Lightweight implementation

## Manual GitHub Pages Deployment

To deploy this app to GitHub Pages:

1. Prepare your files for GitHub Pages:
   ```bash
   # Create .nojekyll file if not already present
   touch .nojekyll
   
   # Add the .nojekyll file to git
   git add .nojekyll
   ```

2. Fix paths for GitHub Pages:
   
   In all HTML files, update paths:
   - Change absolute paths like `/styles/main.css` to relative paths like `styles/main.css`
   - Add base tags to HTML files:
     - For main index.html: `<base href="./">`
     - For game pages: `<base href="../../">`

3. Create and push to gh-pages branch:
   ```bash
   # Create a new orphan branch (no history)
   git checkout --orphan gh-pages
   
   # Add all files
   git add .
   
   # Commit changes
   git commit -m "Deploy to GitHub Pages"
   
   # Push the branch
   git push -f origin gh-pages
   
   # Go back to main branch
   git checkout main
   ```

4. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages, folder: / (root)
   - Click "Save"

Your site will be published at `https://your-username.github.io/repository-name/`

## Manual Path Fixing

To manually fix paths for GitHub Pages deployment:

```bash
# For HTML files - change absolute paths to relative
find . -name "*.html" -type f -exec sed -i '' 's|href="/|href="./|g' {} \;
find . -name "*.html" -type f -exec sed -i '' 's|src="/|src="./|g' {} \;

# Add base tags to game HTML files
find ./games -name "index.html" | xargs -I{} sed -i '' 's|<head>|<head>\n  <base href="../../">|' {}

# Add base tag to main index.html
sed -i '' 's|<head>|<head>\n  <base href="./">|' index.html
```

## Development

### Using as a Static Site
Simply open `index.html` in a web browser or host the files on any web server.

1. Default credentials:
   - Username: `guest`
   - Password: `birthday40`

2. Quick login:
   Add `?autofill` to the URL to pre-fill the login form for testing.

## Project Structure
- `index.html` - Main entry point
- `styles/` - CSS stylesheets
- `scripts/` - JavaScript files
- `assets/` - Images and other static assets
- `server/` - Simple backend for authentication (optional)
- `games/` - Each game in its own folder

## Adding Games
To add new games:
1. Create a new folder in `games/` for each game
2. Implement the game using HTML, CSS, and JavaScript
3. Update the games array in `scripts/games.js` with new game details
