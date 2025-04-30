# Arnold's 40th Birthday Game App

A lightweight mobile-optimized web application featuring 10 mini-games to celebrate Arnold's 40th birthday.

## Features
- Mobile-first responsive design
- Basic authentication
- 2x5 grid of mini-games
- Lightweight implementation

## GitHub Pages Deployment

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

If you encounter deployment errors:

1. Check repository permissions:
   - Go to Settings > Actions > General
   - Under "Workflow permissions", select "Read and write permissions"
   - Save changes

2. Create a `.nojekyll` file in your repository root:
   ```bash
   touch .nojekyll
   git add .nojekyll
   git commit -m "Add .nojekyll file"
   git push
   ```

3. Verify GitHub Pages is configured correctly:
   - Go to Settings > Pages
   - Source should be set to "Deploy from a branch" 
   - Branch should be set to "gh-pages" with "/ (root)"

### GitHub Pages Deployment Workflow

We've provided two GitHub Actions workflows:

1. **Automatic deployment** (deploy.yml):
   - Triggers automatically when you push to main branch
   - Uses GitHub's official Pages deployment action

2. **Manual deployment** (manual-deploy.yml):
   - Can be triggered manually from GitHub's Actions tab
   - Useful if automatic deployment is failing

To manually trigger a deployment:
1. Go to your repository on GitHub
2. Click "Actions" tab
3. Select "Manual Deploy" from the workflows list
4. Click "Run workflow"
5. Enter "deploy" in the input field and click "Run workflow"

### If Deployment Still Fails

If both workflows fail:

1. Enable GitHub Pages directly in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: main (or your main branch), folder: / (root)

2. Manually prepare your repository for GitHub Pages:
   - Add proper base tags to all HTML files
   - Create a .nojekyll file in your repository root
   - Fix any absolute paths in your code

### Authentication Error during Deployment

If you see errors like `fatal: could not read Username for 'https://github.com'`:

1. Check if your organization has restrictions on GitHub Actions:
   - Go to Organization Settings > Actions > General 
   - See what permissions are allowed for workflow tokens

2. Try the simple deployment workflow:
   - Rename `.github/workflows/deploy-simple.yml` to `.github/workflows/deploy.yml`
   - Push changes to trigger a new deployment

3. Set up a personal access token (PAT):
   - Create a token at GitHub Settings > Developer settings > Personal access tokens
   - Give it `repo` permissions
   - Add it to your repository as a secret named `GH_PAT`
   - Update the workflow to use: `git remote set-url origin https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.repository }}.git`

4. Use GitHub Pages settings directly:
   - Go to repository Settings > Pages
   - Set Source to "GitHub Actions"
   - Select a simple workflow

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
