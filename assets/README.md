# Assets Directory

This directory contains all the static assets used in the application, such as images and fonts.

## Current Assets
- `muradin.jpg` - Image asset used in the application

## Images
- Place game icons and images here
- Recommended naming convention for game icons: `[game-name]-icon.png` (e.g., `quiz-icon.png`, `memory-icon.png`)
- Ensure images are optimized for web use to improve performance (consider using formats like WebP for better compression)
- Recommended dimensions for game icons: 128x128px or 256x256px for better display on high-DPI screens

## Fonts
- Add any custom fonts required for the application here
- Include font licenses if applicable
- Consider using web-optimized font formats: WOFF2, WOFF, TTF

## Usage
To use these assets in the application:
1. Add the required images or fonts to this directory
2. Reference them in your HTML/CSS/JS using relative paths:
   ```html
   <!-- In HTML -->
   <img src="assets/muradin.jpg" alt="Muradin">
   ```
   ```css
   /* In CSS */
   .hero-image {
     background-image: url('../assets/muradin.jpg');
   }
   ```
   ```javascript
   // In JavaScript
   const imgUrl = 'assets/muradin.jpg';
   ```

## Best Practices
- Keep file sizes as small as possible without sacrificing quality
- Use descriptive, lowercase filenames with hyphens instead of spaces
- Group assets by type in subdirectories if the collection grows large (e.g., `assets/images/`, `assets/fonts/`)
- Consider adding appropriate alt text and ARIA attributes when using these assets in the UI

## Game-Specific Assets
If adding assets for specific games, consider organizing them in subdirectories:
```
assets/
  common/        # Shared across multiple games
  balloon/       # Assets specific to the balloon game
  cake/          # Assets specific to the cake game
  ...
```
