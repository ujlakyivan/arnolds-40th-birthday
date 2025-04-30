#!/bin/bash

# Create .nojekyll file
echo "Creating .nojekyll file"
touch .nojekyll

# Fix absolute paths in HTML files
echo "Fixing absolute paths in HTML files"
find . -name "*.html" -type f | grep -v "node_modules" | grep -v ".git" | while read file; do
  echo "Processing $file"
  sed -i '' 's|href="/|href="./|g' "$file"
  sed -i '' 's|src="/|src="./|g' "$file"
done

# Add base tags to HTML files
echo "Adding base tags to HTML files"
find ./games -name "index.html" -type f | while read file; do
  if ! grep -q "<base href=" "$file"; then
    echo "Adding base tag to game file: $file"
    sed -i '' 's|<head>|<head>\
  <base href="../../">|' "$file"
  fi
done

find . -maxdepth 1 -name "*.html" -type f | while read file; do
  if ! grep -q "<base href=" "$file"; then
    echo "Adding base tag to root file: $file"
    sed -i '' 's|<head>|<head>\
  <base href="./">|' "$file"
  fi
done

# Fix JavaScript file paths
echo "Fixing JavaScript file paths"
find . -name "*.js" -type f | grep -v "node_modules" | grep -v ".git" | while read file; do
  sed -i '' 's|window.location.href = "/"|window.location.href = "./"|g' "$file"
  sed -i '' 's|window.location.href = "../"|window.location.href = "../"|g' "$file"
done

echo "Path fixing complete!"
echo ""
echo "Next steps:"
echo "1. Test locally by opening index.html in your browser"
echo "2. Commit and push these changes to your repository"
echo "3. Deploy to GitHub Pages using gh-pages branch"
