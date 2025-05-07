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

// Initialize Firestore first (doesn't depend on DOM)
const db = firebase.firestore();

// Initialize Firebase App Check only after DOM is ready
// This prevents the "Cannot read properties of null (reading 'appendChild')" error
function initializeAppCheck() {
    try {
        // Using Firebase v9.22.0 compatibility mode App Check initialization
        const appCheck = firebase.appCheck();
        appCheck.activate(
            new firebase.appCheck.ReCaptchaV3Provider('6LeOETErAAAAALMzex88HulhRAkWGBBg_2IAJzLb'),
            // Set to false for production
            false  // Debug mode
        );
        console.log('Firebase App Check initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase App Check:', error);
        console.warn('Proceeding without App Check. Some features may not be secure.');
    }
}

// Wait for DOM to be fully loaded before initializing App Check
if (document.readyState === 'complete') {
    // DOM already loaded, initialize now
    initializeAppCheck();
} else {
    // Wait for DOM to load
    window.addEventListener('load', initializeAppCheck);
}

console.log('Firebase and Firestore initialized');