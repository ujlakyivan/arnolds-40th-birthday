# Arnold's 40th Birthday Game App

A lightweight mobile-optimized web application featuring 10 mini-games to celebrate Arnold's 40th birthday.

## Features
- Mobile-first responsive design
- Basic authentication
- 2x5 grid of mini-games
- Lightweight implementation

## Getting Started

### Using as a Static Site
Simply open `index.html` in a web browser or host the files on any web server.

1. Default credentials:
   - Username: `guest`
   - Password: `birthday40`

2. Quick login:
   Add `?autofill` to the URL to pre-fill the login form for testing.

### Using the Server (Optional)
1. Install dependencies:
   ```
   cd server
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

3. Access the app at `http://localhost:3000`

## Project Structure
- `index.html` - Main entry point
- `styles/` - CSS stylesheets
- `scripts/` - JavaScript files
- `assets/` - Images and other static assets
- `server/` - Simple backend for authentication (optional)
- `games/` - Each game will have its own folder (to be implemented)

## Adding Games
To add new games:
1. Create a new folder in `games/` for each game
2. Implement the game using HTML, CSS, and JavaScript
3. Update the games array in `scripts/games.js` with new game details
