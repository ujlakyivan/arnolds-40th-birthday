/*
 * This is a simple server setup that you can implement later if needed.
 * For initial development, the front-end uses hardcoded authentication.
 * 
 * To implement this server:
 * 1. Install Node.js
 * 2. Run `npm init` in this directory
 * 3. Install required dependencies: express, cors, jsonwebtoken
 *    (`npm install express cors jsonwebtoken`)
 * 4. Run the server with `node server.js`
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'arnold-40th-birthday-secret'; // Change in production!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // In a real app, validate against a database
    if (username === 'guest' && password === 'birthday40') {
        // Create JWT token
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Protected route example
app.get('/api/games', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        jwt.verify(token, JWT_SECRET);
        // Return games data - would be from a database in a real app
        res.json({ success: true, games: [] });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
