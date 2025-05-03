// Game Completion Service for Firebase Firestore
const GameCompletionService = {
  /**
   * Get all users' game completions
   */
  async getAllCompletions() {
    try {
      // Wait for Firebase authentication
      await this.ensureAuth();
      
      // Get completions collection
      const completionsSnapshot = await db.collection('gameCompletions').get();
      const allCompletions = {};
      
      completionsSnapshot.forEach(doc => {
        const data = doc.data();
        allCompletions[data.username] = data.completions || {};
      });
      
      return allCompletions;
    } catch (err) {
      console.error('Error getting game completions from Firestore:', err);
      
      // Fallback to local storage
      return StorageUtils.getFromStorage('gameCompletions', {});
    }
  },
  
  /**
   * Get completions for a specific user
   */
  async getUserCompletions(username) {
    try {
      // Wait for Firebase authentication
      await this.ensureAuth();
      
      // Get user's completions document
      const userCompletionsRef = await db.collection('gameCompletions')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (!userCompletionsRef.empty) {
        const doc = userCompletionsRef.docs[0];
        return doc.data().completions || {};
      }
      
      return {};
    } catch (err) {
      console.error(`Error getting completions for user ${username}:`, err);
      
      // Fallback to local storage
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      return allCompletions[username] || {};
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
      
      // Update local storage
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (!allCompletions[username]) {
        allCompletions[username] = {};
      }
      allCompletions[username][gameId] = true;
      StorageUtils.saveToStorage('gameCompletions', allCompletions);
      
      return true;
    } catch (err) {
      console.error(`Error marking game ${gameId} as completed for ${username}:`, err);
      
      // Fallback to local storage only
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (!allCompletions[username]) {
        allCompletions[username] = {};
      }
      allCompletions[username][gameId] = true;
      
      return StorageUtils.saveToStorage('gameCompletions', allCompletions);
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
      
      // Update local storage
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (allCompletions[username] && allCompletions[username][gameId]) {
        delete allCompletions[username][gameId];
        StorageUtils.saveToStorage('gameCompletions', allCompletions);
      }
      
      return true;
    } catch (err) {
      console.error(`Error resetting game ${gameId} completion for ${username}:`, err);
      
      // Fallback to local storage only
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (allCompletions[username] && allCompletions[username][gameId]) {
        delete allCompletions[username][gameId];
        return StorageUtils.saveToStorage('gameCompletions', allCompletions);
      }
      
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
      
      // Update local storage
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (allCompletions[username]) {
        allCompletions[username] = {};
        StorageUtils.saveToStorage('gameCompletions', allCompletions);
      }
      
      return true;
    } catch (err) {
      console.error(`Error resetting all completions for ${username}:`, err);
      
      // Fallback to local storage only
      const allCompletions = StorageUtils.getFromStorage('gameCompletions', {});
      if (allCompletions[username]) {
        allCompletions[username] = {};
        return StorageUtils.saveToStorage('gameCompletions', allCompletions);
      }
      
      return false;
    }
  },
  
  /**
   * Ensure Firebase auth is initialized
   */
  async ensureAuth() {
    if (!firebase.auth().currentUser) {
      return new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
        
        // Set a timeout in case auth takes too long
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 5000);
      });
    }
    return Promise.resolve();
  }
};

// Explicitly attach to window object for global access
window.GameCompletionService = GameCompletionService;