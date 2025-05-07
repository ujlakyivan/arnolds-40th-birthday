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

// Initialize Firebase App Check for added security
// You'll need to register a reCAPTCHA v3 site key in the Google Cloud Console
// and add it to your Firebase console
try {
    const appCheck = firebase.appCheck();
    // Replace 'YOUR_RECAPTCHA_SITE_KEY' with the actual site key you'll get from Google reCAPTCHA
    appCheck.activate(
        new firebase.appCheck.ReCaptchaV3Provider('6LeOETErAAAAALMzex88HulhRAkWGBBg_2IAJzLb'),
        // Set to true for development, false for production
        false  // Debug mode - remove or set to false when deploying to production
    );
    console.log('Firebase App Check initialized');
} catch (error) {
    console.error('Error initializing Firebase App Check:', error);
}

// Initialize Firestore
const db = firebase.firestore();

// For anonymous Firestore access - enables reading without authentication
// This depends on your Firestore security rules being properly configured
// to allow unauthenticated reads to necessary collections
console.log('Firebase and Firestore initialized');