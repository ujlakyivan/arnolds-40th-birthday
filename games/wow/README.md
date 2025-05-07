# Trivia Game Firebase Integration

This document provides instructions for moving the trivia questions from the local JSON file to Firebase Firestore.

## Prerequisites

1. Firebase project setup (already done)
2. Firebase Admin SDK service account key

## Setup Instructions

### Step 1: Generate a Firebase Admin SDK Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `a-birthday-f40c3`
3. Click on the gear icon (⚙️) next to "Project Overview" to access Project Settings
4. Go to the "Service accounts" tab
5. Click on "Generate new private key"
6. Save the downloaded JSON file as `firebase-admin-key.json` in the `/server` directory

### Step 2: Install the Firebase Admin SDK

Run the following command in the `/server` directory:

```bash
npm install
```

This will install the Firebase Admin SDK and other dependencies.

### Step 3: Upload Trivia Questions to Firebase

Run the following command in the `/server` directory:

```bash
npm run upload-trivia
```

This script will:
1. Read all questions from the local `questions.json` file
2. Upload them to a Firestore collection named `triviaQuestions`
3. Provide confirmation when the upload is complete

### Step 4: Verify the Data in Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Firestore Database" in the left navigation
4. Check that the `triviaQuestions` collection exists and contains all your questions

## How It Works

The trivia game now loads questions from Firebase Firestore instead of the local JSON file. If Firestore is unavailable for any reason, it falls back to the local JSON file for maximum reliability.

## Security

Make sure your Firestore security rules allow reading the trivia questions. Here's an example rule:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read trivia questions
    match /triviaQuestions/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Other rules for your application
    // ...
  }
}
```