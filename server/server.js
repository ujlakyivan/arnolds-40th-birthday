/*
 * Server implementation for Arnold's 40th Birthday Games
 * with proper user management and admin functionality
 * 
 * To implement this server:
 * 1. Install Node.js
 * 2. Run `npm init` in this directory
 * 3. Install required dependencies: express, cors, jsonwebtoken, bcrypt, dotenv
 *    (`npm install express cors jsonwebtoken bcrypt dotenv`)
 * 4. Run the server with `node server.js`
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'arnold-40th-birthday-secret'; // Change in production!
const SALT_ROUNDS = 10;

// Settings database path
const SETTINGS_DB_PATH = path.join(__dirname, 'settings.json');

// Initialize settings if they don't exist
function initSettingsDb() {
    if (!fs.existsSync(SETTINGS_DB_PATH)) {
        const defaultSettings = {
            questionsToUse: 20,
            timeLimit: 15,
            enableConfetti: true
        };
        fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(defaultSettings, null, 2));
        console.log('Default settings initialized');
    }
}

// User database - in a real app, use a proper database
const USER_DB_PATH = path.join(__dirname, 'users.json');

// Initialize users database if it doesn't exist
function initUserDb() {
    if (!fs.existsSync(USER_DB_PATH)) {
        // Create initial admin and test user with hashed passwords
        const hashedAdminPwd = bcrypt.hashSync('admin40', SALT_ROUNDS);
        const hashedUserPwd = bcrypt.hashSync('gfy', SALT_ROUNDS);
        
        const initialUsers = {
            users: [
                {
                    id: 1,
                    username: 'admin',
                    password: hashedAdminPwd,
                    role: 'admin',
                    created: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'muradin',
                    password: hashedUserPwd,
                    role: 'user',
                    created: new Date().toISOString()
                }
            ]
        };
        
        fs.writeFileSync(USER_DB_PATH, JSON.stringify(initialUsers, null, 2));
        console.log('User database initialized');
    }
}

// Load users from database
function loadUsers() {
    try {
        if (fs.existsSync(USER_DB_PATH)) {
            const data = fs.readFileSync(USER_DB_PATH, 'utf8');
            return JSON.parse(data).users || [];
        }
    } catch (err) {
        console.error('Error loading users:', err);
    }
    return [];
}

// Save users to database
function saveUsers(users) {
    try {
        fs.writeFileSync(USER_DB_PATH, JSON.stringify({ users }, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving users:', err);
        return false;
    }
}

// Initialize database on startup
initSettingsDb();
initUserDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Verify admin middleware
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Verify user middleware (any authenticated user)
const verifyUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        // Send user info but exclude password
        const { password: _, ...userInfo } = user;
        
        res.json({ 
            success: true, 
            token,
            user: userInfo
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get user profile
app.get('/api/profile', verifyUser, (req, res) => {
    const users = loadUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const { password: _, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
});

// User management endpoints (admin only)
// Get all users
app.get('/api/users', verifyAdmin, (req, res) => {
    const users = loadUsers();
    
    // Remove passwords before sending
    const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
    });
    
    res.json({ success: true, users: safeUsers });
});

// Create new user
app.post('/api/users', verifyAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username, password, and role are required' 
        });
    }
    
    const users = loadUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        return res.status(409).json({ 
            success: false, 
            message: 'Username already exists' 
        });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user
    const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password: hashedPassword,
        role,
        created: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save users
    if (saveUsers(users)) {
        const { password: _, ...userInfo } = newUser;
        res.status(201).json({ success: true, user: userInfo });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Error saving user' 
        });
    }
});

// Update user
app.put('/api/users/:userId', verifyAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { username, password, role } = req.body;
    
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if updating username and if it already exists
    if (username && username !== users[userIndex].username) {
        if (users.some(u => u.username === username)) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }
        users[userIndex].username = username;
    }
    
    // Update password if provided
    if (password) {
        users[userIndex].password = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    // Update role if provided
    if (role) {
        users[userIndex].role = role;
    }
    
    // Add updated timestamp
    users[userIndex].updated = new Date().toISOString();
    
    // Save users
    if (saveUsers(users)) {
        const { password: _, ...userInfo } = users[userIndex];
        res.json({ success: true, user: userInfo });
    } else {
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

// Delete user
app.delete('/api/users/:userId', verifyAdmin, (req, res) => {
    const userId = parseInt(req.params.userId);
    
    // Prevent deleting the last admin
    if (userId === req.user.id) {
        return res.status(400).json({ 
            success: false, 
            message: 'Cannot delete your own account' 
        });
    }
    
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if this is the last admin
    if (users[userIndex].role === 'admin') {
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the last admin account'
            });
        }
    }
    
    // Remove user
    users.splice(userIndex, 1);
    
    // Save users
    if (saveUsers(users)) {
        res.json({ success: true, message: 'User deleted successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

// Change own password (any user)
app.post('/api/change-password', verifyUser, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Current password and new password are required' 
        });
    }
    
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify current password
    if (!bcrypt.compareSync(currentPassword, users[userIndex].password)) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password
    users[userIndex].password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    users[userIndex].updated = new Date().toISOString();
    
    // Save users
    if (saveUsers(users)) {
        res.json({ success: true, message: 'Password changed successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Error changing password' });
    }
});

// Game settings endpoints

// Load settings from file
function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_DB_PATH)) {
            const data = fs.readFileSync(SETTINGS_DB_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
    
    // Return default settings if file doesn't exist or can't be read
    return {
        questionsToUse: 20,
        timeLimit: 15,
        enableConfetti: true
    };
}

// Save settings to file
function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(settings, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving settings:', err);
        return false;
    }
}

// Get game settings
app.get('/api/settings', verifyUser, (req, res) => {
    try {
        const settings = loadSettings();
        res.json({ success: true, settings });
    } catch (err) {
        console.error('Error getting settings:', err);
        res.status(500).json({ success: false, message: 'Error getting settings' });
    }
});

// Update game settings (admin only)
app.put('/api/settings', verifyAdmin, (req, res) => {
    const { settings } = req.body;
    
    if (!settings) {
        return res.status(400).json({ success: false, message: 'Settings are required' });
    }
    
    try {
        // Save to local file
        if (saveSettings(settings)) {
            res.json({ success: true, settings });
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ success: false, message: 'Error updating settings' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
