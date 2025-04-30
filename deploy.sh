#!/bin/bash

echo "Starting manual deployment process..."

# Create .nojekyll file if it doesn't exist
if [ ! -f .nojekyll ]; then
  echo "Creating .nojekyll file"
  touch .nojekyll
fi

echo "Fixing paths in HTML files..."

# Find all HTML files and fix paths
find . -name "*.html" -type f | grep -v "node_modules" | grep -v ".git" | while read file; do
  echo "Processing $file"
  
  # Fix absolute paths
  sed -i '' 's|href="/|href="./|g' "$file"
  sed -i '' 's|src="/|src="./|g' "$file"
  
  # Add base tag if needed
  if grep -q "/games/" <<< "$file" && ! grep -q "<base href=" "$file"; then
    echo "Adding game base tag to $file"
    sed -i '' 's|<head>|<head>\
  <base href="../../">|' "$file"
  elif ! grep -q "<base href=" "$file"; then
    echo "Adding base tag to $file"
    sed -i '' 's|<head>|<head>\
  <base href="./">|' "$file"
  fi
done

echo "Path fixing completed"
echo ""
echo "Now you can push to GitHub with:"
echo "git add ."
echo "git commit -m \"Prepare for GitHub Pages deployment\""
echo "git push origin main"
echo ""
echo "Then go to your repository settings and ensure GitHub Pages is enabled for the main branch."
