# Manual Deployment to GitHub Pages

This document provides detailed instructions for manually deploying the Arnold's 40th Birthday app to GitHub Pages without using GitHub Actions.

## Step 1: Prepare Your Repository

First, make sure your local repository is up to date:

```bash
# Ensure you're on the main branch
git checkout main

# Pull latest changes if working with a team
git pull origin main
```

## Step 2: Fix Paths for GitHub Pages

GitHub Pages will host your site at `https://username.github.io/repository-name/`, so relative paths are important:

```bash
# Create .nojekyll file (prevents GitHub's Jekyll processing)
touch .nojekyll

# Fix HTML paths
find . -name "*.html" -type f | grep -v "node_modules" | grep -v ".git" | while read file; do
  # Fix absolute paths
  sed -i '' 's|href="/|href="./|g' "$file"
  sed -i '' 's|src="/|src="./|g' "$file"
done

# Add base tags to HTML files
find ./games -name "index.html" | while read file; do
  if ! grep -q "<base href=" "$file"; then
    sed -i '' 's|<head>|<head>\
  <base href="../../">|' "$file"
  fi
done

find . -maxdepth 1 -name "*.html" | while read file; do
  if ! grep -q "<base href=" "$file"; then
    sed -i '' 's|<head>|<head>\
  <base href="./">|' "$file"
  fi
done

# Fix JS file paths
find . -name "*.js" -type f | grep -v "node_modules" | grep -v ".git" | while read file; do
  sed -i '' 's|window.location.href = "/"|window.location.href = "./"|g' "$file"
done
```

## Step 3: Create and Push the gh-pages Branch

```bash
# Create a new orphan branch (no history)
git checkout --orphan gh-pages

# Add all files to the new branch
git add .
git add .nojekyll  # Make sure the .nojekyll file is included

# Commit the changes
git commit -m "Manual deployment to GitHub Pages"

# Push to the gh-pages branch
git push -f origin gh-pages

# Return to your main branch
git checkout main
```

## Step 4: Configure GitHub Pages in Repository Settings

1. Go to your GitHub repository in a web browser
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. For "Source", select "Deploy from a branch"
5. For "Branch", select "gh-pages" and "/ (root)"
6. Click "Save"

GitHub will process your site and provide a URL like `https://username.github.io/repository-name/`

## Step 5: Verify Your Deployment

1. Wait a few minutes for GitHub to build and deploy your site
2. Visit the provided URL to ensure everything works correctly
3. Test navigation between pages and game placeholders
4. Check that the login functionality works properly

## Troubleshooting

If your deployment isn't working correctly:

1. **404 errors**: 
   - Check that the repository name in your URL is correct
   - Verify that you've pushed to the correct branch (gh-pages)
   - Make sure your repository is public (required for GitHub Pages with free accounts)

2. **CSS/JS not loading**:
   - Check your path references - they should be relative, not absolute
   - Verify that the .nojekyll file exists in your gh-pages branch

3. **Game pages not working**:
   - Ensure base tags are properly set to "../../" 
   - Check console for any path-related errors

4. **Blank page**:
   - Check if index.html exists at the repository root
   - Verify HTML is valid and properly formatted
