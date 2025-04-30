# Arnold's 40th Birthday Game App

A lightweight mobile-optimized web application featuring 10 mini-games to celebrate Arnold's 40th birthday.

## Overview
This application is designed to provide a fun and interactive way to celebrate Arnold's 40th birthday. It features a collection of mini-games, a responsive design for mobile devices, and basic authentication for secure access.

## Features
- **Mobile-first responsive design**: Optimized for mobile devices.
- **Basic authentication**: Secure login for users.
- **10 Mini-games**: A collection of engaging games including:
  - Balloon
  - Cake
  - Clicker
  - Hunt
  - Memory
  - Puzzle
  - Quiz
  - Racer
  - Trivia
  - Words
- **Lightweight implementation**: Fast and efficient performance.

## Project Structure
```
index.html                  # Main application entry point
scripts/                    # JavaScript files
  app.js                    # Main application logic
  auth.js                   # Authentication functionality
  games.js                  # Games configuration and management
  utils.js                  # Utility functions
styles/                     # CSS stylesheets
  main.css                  # Main application styles
  auth.css                  # Authentication styles
  games.css                 # Game grid styles
games/                      # Individual game implementations
  game-template.css         # Common styling for games
  game-template.js          # Common functionality for games
  check-paths.html          # Tool to verify game paths
  balloon/                  # Balloon game
  cake/                     # Cake game
  clicker/                  # Clicker game
  hunt/                     # Hunt game
  memory/                   # Memory game
  puzzle/                   # Puzzle game
  quiz/                     # Quiz game
  racer/                    # Racer game
  trivia/                   # Trivia game
  words/                    # Words game
assets/                     # Static assets
  muradin.jpg               # Image asset
server/                     # Server-side code
  server.js                 # Server implementation
util/                       # Utility tools
  navigation-check.html     # Navigation verification tool
```

## Getting Started

### Prerequisites
- Node.js and npm installed on your system.

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/a-birthday.git
cd a-birthday

# Install dependencies
npm install
```

### Usage
```bash
# Start the application
npm start
```

## Development Notes
- Each game is implemented in its own directory under `/games/`
- Common game styling and functionality is in the template files
- The main application uses the scripts in the `/scripts/` directory to manage games and authentication

## GitHub Pages Deployment

To deploy this app to GitHub Pages:

1. Prepare your files for GitHub Pages:
   ```bash
   # Create .nojekyll file if not already present
   touch .nojekyll
   
   # Add the .nojekyll file to git
   git add .nojekyll
   ```

2. Fix paths for GitHub Pages:
   - Change absolute paths like `/styles/main.css` to relative paths like `styles/main.css`.
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
   - Click "Save".

Your site will be published at `https://your-username.github.io/repository-name/`.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push to your fork.
4. Submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
