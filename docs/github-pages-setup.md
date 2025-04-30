# GitHub Pages Deployment Guide

This guide will walk you through deploying Arnold's 40th Birthday App on GitHub Pages.

## Step 1: Prepare Your Code for GitHub Pages

First, let's make some small adjustments to ensure all paths work correctly on GitHub Pages:

1. Create a `.nojekyll` file in your project root:
   ```
   touch /Users/ivan.ujlaky/a-birthday/.nojekyll
   ```
   This prevents GitHub from processing your files with Jekyll, which can cause path issues.

2. If your repository won't be at the root domain (it will be at username.github.io/repo-name), update your paths:

   Either:
   
   a. Use relative paths in all HTML/CSS/JS files:
      - Change `/styles/main.css` to `styles/main.css`
      - Change `/games/game-template.css` to `games/game-template.css`
      
   Or:
   
   b. Add a base tag to your HTML files:
      ```html
      <base href="https://yourusername.github.io/your-repo-name/">
      ```

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in or create an account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "arnolds-40th-birthday")
4. Make it public (GitHub Pages requires public repositories for free accounts)
5. Don't initialize with a README (we'll push your existing code)
6. Click "Create repository"

## Step 3: Push Your Code to GitHub

From your project directory, run the following commands:

```bash
# Initialize Git repository if not already initialized
git init

# Add all files
git add .

# Commit your files
git commit -m "Initial commit of Arnold's 40th Birthday App"

# Add your GitHub repository as a remote
git remote add origin https://github.com/YOUR_USERNAME/arnolds-40th-birthday.git

# Push your code to GitHub
git push -u origin main
```

Note: If your default branch is named "master" instead of "main", use that name in the commands.

## Step 4: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "GitHub Pages" section (or click "Pages" in the left sidebar)
4. Under "Source", select the branch you pushed to (main or master)
5. Select "/ (root)" as the folder
6. Click "Save"
7. Wait a few minutes for your site to deploy

Your site will be available at `https://YOUR_USERNAME.github.io/arnolds-40th-birthday/`

## Step 5: Verify Deployment

1. Visit the URL GitHub provides (it will appear in the GitHub Pages section)
2. Check that all links, images, and scripts work correctly
3. Test the login functionality
4. Verify that all game placeholders load properly

## Troubleshooting Common Issues

### Broken Links

If links are broken, check that:
- You're using the correct relative paths
- The `.nojekyll` file exists in your repository

### CORS Issues

If you see CORS errors in the console:
- Make sure your paths are correct
- Using a `.nojekyll` file should prevent most CORS issues

### Authentication Issues

Since this app uses localStorage for authentication:
- Make sure your browser has cookies/localStorage enabled
- The app should work normally as authentication is client-side

## Automating Deployment

For automatic deployment when you push changes, create a GitHub Actions workflow:

1. Create a file at `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # or master, depending on your default branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: .
```

This will automatically deploy your site whenever you push to your main branch.
