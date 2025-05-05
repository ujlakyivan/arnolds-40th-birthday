// Game Completion Service for Firebase Firestore
const GameCompletionService = {
  /**
   * Get all users' game completions
   */
  async getAllCompletions() {
    try {
      // Try to get completions from Firestore
      try {
        const completionsSnapshot = await db.collection('gameCompletions').get();
        const allCompletions = {};
        
        completionsSnapshot.forEach(doc => {
          const data = doc.data();
          allCompletions[data.username] = data.completions || {};
        });
        
        return allCompletions;
      } catch (firestoreErr) {
        // Handle Firestore permission errors gracefully
        console.warn('Could not access Firestore game completions - using empty data:', firestoreErr.message);
        
        // If we can't access Firestore due to permissions, return empty data
        // This allows the UI to still function without errors
        return {};
      }
    } catch (err) {
      console.error('Error getting game completions from Firestore:', err);
      // Return empty object as fallback
      return {};
    }
  },
  
  /**
   * Get completions for a specific user
   */
  async getUserCompletions(username) {
    try {
      try {
        // Get user's completions document
        const userCompletionsRef = await db.collection('gameCompletions')
          .where('username', '==', username)
          .limit(1)
          .get();
        
        if (!userCompletionsRef.empty) {
          const doc = userCompletionsRef.docs[0];
          return doc.data().completions || {};
        }
      } catch (firestoreErr) {
        console.warn(`Could not access Firestore completions for user ${username}:`, firestoreErr.message);
      }
      
      // Return empty object if not found or permissions error
      return {};
    } catch (err) {
      console.error(`Error getting completions for user ${username}:`, err);
      // Return empty object as fallback
      return {};
    }
  },
  
  /**
   * Mark a game as completed for a user
   */
  async markGameCompleted(username, gameId) {
    try {
      // Wait for Firebase authentication
      await this.ensureAuth();
      
      // Find user's completions document
      const userCompletionsRef = await db.collection('gameCompletions')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (userCompletionsRef.empty) {
        // Create new document if it doesn't exist
        await db.collection('gameCompletions').add({
          username,
          completions: {
            [gameId]: true
          },
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Update existing document
        const docRef = userCompletionsRef.docs[0].ref;
        await docRef.update({
          [`completions.${gameId}`]: true,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return true;
    } catch (err) {
      console.error(`Error marking game ${gameId} as completed for ${username}:`, err);
      return false;
    }
  },
  
  /**
   * Reset (remove) a game completion for a user
   */
  async resetGameCompletion(username, gameId) {
    try {
      // Wait for Firebase authentication
      await this.ensureAuth();
      
      // Find user's completions document
      const userCompletionsRef = await db.collection('gameCompletions')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (!userCompletionsRef.empty) {
        // Update document - remove the game completion
        const docRef = userCompletionsRef.docs[0].ref;
        await docRef.update({
          [`completions.${gameId}`]: firebase.firestore.FieldValue.delete(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return true;
    } catch (err) {
      console.error(`Error resetting game ${gameId} completion for ${username}:`, err);
      return false;
    }
  },
  
  /**
   * Reset all game completions for a user
   */
  async resetAllCompletions(username) {
    try {
      // Wait for Firebase authentication
      await this.ensureAuth();
      
      // Find user's completions document
      const userCompletionsRef = await db.collection('gameCompletions')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (!userCompletionsRef.empty) {
        // Update document - reset all completions
        const docRef = userCompletionsRef.docs[0].ref;
        await docRef.update({
          completions: {},
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return true;
    } catch (err) {
      console.error(`Error resetting all completions for ${username}:`, err);
      return false;
    }
  },
  
  /**
   * Ensure authentication is ready - without relying on Firebase Auth
   */
  async ensureAuth() {
    // Check if we have auth info in sessionStorage
    const authInfo = JSON.parse(sessionStorage.getItem('authInfo'));
    
    if (authInfo && authInfo.token) {
      // We have authentication info, proceed
      return Promise.resolve();
    }
    
    // For operations that require authentication
    return Promise.reject(new Error('Authentication required'));
  }
};

// Explicitly attach to window object for global access
window.GameCompletionService = GameCompletionService;