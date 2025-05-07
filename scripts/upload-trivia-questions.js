/**
 * Script to upload trivia questions from the local JSON file to Firebase Firestore
 * Run this script once to initialize the trivia questions in Firebase
 */

// Load the questions from the local JSON file
const fs = require('fs');
const path = require('path');

// Attempt to use firebase-admin from node_modules in the parent directory
let admin;
try {
  // First try the server directory's node_modules (where we installed it)
  admin = require('../server/node_modules/firebase-admin');
  console.log('Successfully loaded firebase-admin from server/node_modules');
} catch (error) {
  try {
    // Fall back to a direct require if that fails
    admin = require('firebase-admin');
    console.log('Successfully loaded firebase-admin from global node_modules');
  } catch (secondError) {
    console.error('Failed to load firebase-admin module.');
    console.error('Original error:', error.message);
    console.error('Secondary error:', secondError.message);
    console.error('Make sure to run: cd server && npm install firebase-admin');
    process.exit(1);
  }
}

// Path to your service account key file (you'll need to create this)
// You can download this from Firebase Console -> Project Settings -> Service Accounts
const serviceAccountPath = path.join(__dirname, '../server/firebase-admin-key.json');

// Check if the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Firebase Admin SDK key file not found!');
  console.log('Please download your service account key from Firebase Console:');
  console.log('1. Go to Firebase Console -> Project Settings -> Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as "firebase-admin-key.json" in the server directory');
  process.exit(1);
}

// Path to the questions JSON file
const questionsFilePath = path.join(__dirname, '../games/trivia/questions.json');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Reference to Firestore
const db = admin.firestore();

// Load and upload questions
async function uploadQuestions() {
  try {
    // Read questions file
    const questionsData = fs.readFileSync(questionsFilePath, 'utf8');
    const { questions } = JSON.parse(questionsData);

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error('No questions found in the JSON file!');
      process.exit(1);
    }

    console.log(`Loaded ${questions.length} questions from the JSON file`);

    // Create a collection reference
    const triviaCollectionRef = db.collection('triviaQuestions');
    
    // Create a batch to perform all writes atomically
    const batch = db.batch();
    
    // Add each question to the batch
    questions.forEach((question, index) => {
      const docRef = triviaCollectionRef.doc(`question_${index + 1}`);
      batch.set(docRef, {
        question: question.question,
        options: question.options,
        answer: question.answer,
        // Add any additional metadata if needed
        index: index + 1
      });
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`Successfully uploaded ${questions.length} questions to Firestore!`);
    console.log('Collection: triviaQuestions');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Execute the upload function
uploadQuestions();