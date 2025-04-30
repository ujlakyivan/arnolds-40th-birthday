# Arnold's 40th Birthday Game App

A lightweight mobile-optimized web application featuring 10 mini-games to celebrate Arnold's 40th birthday.

## Features
- Mobile-first responsive design
- Basic authentication
- 2x5 grid of mini-games
- Lightweight implementation

## Automatic GitHub Pages Deployment

This project is set up with GitHub Actions for automatic deployment to GitHub Pages:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. The workflow will automatically:
   - Fix paths for GitHub Pages compatibility
   - Deploy to the `gh-pages` branch
   - Make your site available at `https://your-username.github.io/a-birthday/`

3. Check deployment status in the "Actions" tab of your GitHub repository

## Troubleshooting Deployment Issues

If you encounter deployment errors (like exit code 128):

1. Check repository permissions:
   - Go to Settings > Actions > General
   - Under "Workflow permissions", select "Read and write permissions"
   - Save changes

2. Try the alternative deployment workflow:
   - Rename `.github/workflows/deploy-alternative.yml` to `.github/workflows/deploy.yml`
   - Push the changes to trigger a new deployment

3. Manual deployment option:
   - In your repository Settings > Pages
   - Set Source to "GitHub Actions"
   - If needed, create a personal access token with repo permissions
   - Add it in Settings > Secrets > Actions as `DEPLOY_TOKEN`

## Manual Deployment Steps

If you need to deploy manually:

1. Run the path-fixing script:
   ```bash
   node tools/fix-paths.js
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Fix paths for deployment"
   git push
   ```

3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select branch: `main` (or your main branch)
   - Select folder: `/ (root)`
   - Click "Save"

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
- `.github/workflows/` - Automatic deployment configuration

## Adding Games
To add new games:
1. Create a new folder in `games/` for each game
2. Implement the game using HTML, CSS, and JavaScript
3. Update the games array in `scripts/games.js` with new game details
