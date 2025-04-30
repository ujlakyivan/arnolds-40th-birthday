# Troubleshooting 404 Resource Errors

When you see "Failed to load resource: the server responded with a status of 404" errors in your browser console, follow these steps to diagnose and fix the issues.

## Step 1: Identify the Missing Resources

1. Open your browser's developer tools (F12 or Right-click > Inspect)
2. Go to the Console tab
3. Look for red 404 errors and note which files are missing
4. Check the exact path the browser is trying to load

## Step 2: Fix Common Path Issues

### Incorrect Relative Paths

If your site is hosted at `https://username.github.io/repository-name/`:

```html
<!-- Wrong -->
<link rel="stylesheet" href="/styles/main.css">

<!-- Correct -->
<link rel="stylesheet" href="styles/main.css">
<!-- or if in a subfolder -->
<link rel="stylesheet" href="../styles/main.css">
```

### Missing Base Tag

Game pages need proper base tags since they're in a different directory level:

```html
<!-- Add this to main index.html -->
<head>
  <base href="./">
  <!-- rest of head content -->
</head>

<!-- Add this to game HTML files -->
<head>
  <base href="../../">
  <!-- rest of head content -->
</head>
```

### Case Sensitivity

GitHub Pages is case-sensitive, unlike local development on Windows:

```html
<!-- These are different files on GitHub Pages -->
<img src="Image.jpg">
<img src="image.jpg">
```

## Step 3: Check File Existence

1. Verify the file actually exists in your repository
2. Make sure it was committed and pushed to the gh-pages branch
3. Check if the file path matches the case of the actual file

## Step 4: Fix Path References

Run these commands to fix common path issues:

```bash
# Create .nojekyll file
touch .nojekyll

# Fix paths in HTML files
find . -name "*.html" -type f | grep -v "node_modules" | while read file; do
  # Replace absolute paths with relative
  sed -i '' 's|href="/|href="./|g' "$file"
  sed -i '' 's|src="/|src="./|g' "$file"
done

# Add base tags
find ./games -name "index.html" | while read file; do
  if ! grep -q "<base href=" "$file"; then
    sed -i '' 's|<head>|<head>\n  <base href="../../">|' "$file"
  fi
done

find . -maxdepth 1 -name "*.html" | while read file; do
  if ! grep -q "<base href=" "$file"; then
    sed -i '' 's|<head>|<head>\n  <base href="./">|' "$file"
  fi
done
```

## Step 5: Redeploy Your Site

```bash
git add .
git commit -m "Fix resource paths"
git checkout --orphan gh-pages
git add .
git commit -m "Deploy to GitHub Pages with fixed paths"
git push -f origin gh-pages
```

## Step 6: Check for Jekyll Processing Issues

Make sure your repository has a `.nojekyll` file at the root to prevent Jekyll processing, which might ignore certain files or directories.

## Step 7: Verify Repository Settings

1. Go to your repository's Settings > Pages
2. Ensure the source is set to the correct branch (gh-pages)
3. Make sure the folder is set to root (/)
4. Verify your site is published at the correct URL
