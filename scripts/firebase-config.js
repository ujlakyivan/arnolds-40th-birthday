// Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDI8QcW874Hzwy2_zbJcKwhyNTu58_Lwu0",
    authDomain: "a-birthday-f40c3.firebaseapp.com",
    projectId: "a-birthday-f40c3",
    storageBucket: "a-birthday-f40c3.firebasestorage.app",
    messagingSenderId: "790194017270",
    appId: "1:790194017270:web:91556562dd422e8aa02dd7"
  };
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Sign in anonymously for Firestore access
firebase.auth().signInAnonymously()
  .then(() => {
    console.log('Signed in anonymously to Firebase');
  })
  .catch((error) => {
    console.error('Anonymous auth error:', error);
  });

// Set persistence to local for better offline experience
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });