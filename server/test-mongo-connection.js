// Load environment variables from .env file
require('dotenv').config();

const { MongoClient } = require('mongodb');

// MongoDB connection URI
// Replace with your actual MongoDB Atlas connection string (or keep local for testing)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/birthday-app';

async function testMongoConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`URI: ${MONGO_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')}`);
  
  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    // Get the database
    const db = client.db('birthday-app');
    console.log('Successfully connected to MongoDB!');
    
    // Test basic operations
    console.log('Testing settings collection...');
    
    // Try to get existing settings
    const existingSettings = await db.collection('settings').findOne({ type: 'global' });
    
    if (existingSettings) {
      console.log('Found existing settings:', existingSettings);
    } else {
      console.log('No settings found. Creating default settings...');
      
      // Create default settings
      const defaultSettings = {
        type: 'global',
        questionsToUse: 20,
        timeLimit: 15,
        enableConfetti: true,
        createdAt: new Date()
      };
      
      const result = await db.collection('settings').insertOne(defaultSettings);
      console.log('Default settings created:', result.insertedId);
      
      // Verify settings were created
      const newSettings = await db.collection('settings').findOne({ type: 'global' });
      console.log('Verified new settings:', newSettings);
    }
    
    console.log('MongoDB connection and operations test successful!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

testMongoConnection().catch(console.error);