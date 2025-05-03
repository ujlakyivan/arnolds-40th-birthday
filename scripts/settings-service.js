// Settings service for cloud storage with Firebase
const SettingsService = {
  /**
   * Get settings from Firestore with local storage fallback
   */
  async getSettings() {
    try {
      // First ensure authentication is complete
      if (!firebase.auth().currentUser) {
        await new Promise((resolve) => {
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
      
      // Now try to get from Firestore
      const doc = await db.collection('settings').doc('global').get();
      
      if (doc.exists) {
        console.log('Settings loaded from Firestore');
        return doc.data();
      }
      
      // If not found in Firestore, try local storage
      const localSettings = localStorage.getItem('gameSettings');
      if (localSettings) {
        const settings = JSON.parse(localSettings);
        console.log('Settings loaded from localStorage');
        
        // Save to Firestore for future use
        this.updateSettings(settings);
        
        return settings;
      }
      
      // If nothing exists, use defaults
      return this.getDefaultSettings();
    } catch (err) {
      console.error('Error loading settings:', err);
      
      // Try local storage as fallback on error
      const localSettings = localStorage.getItem('gameSettings');
      return localSettings ? JSON.parse(localSettings) : this.getDefaultSettings();
    }
  },
  
  /**
   * Update settings in Firestore and local storage
   */
  async updateSettings(settings) {
    try {
      // Ensure authentication is complete before saving
      if (!firebase.auth().currentUser) {
        await new Promise((resolve) => {
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
      
      // Save to Firestore
      await db.collection('settings').doc('global').set(settings);
      
      // Also update local storage as fallback
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      
      return { success: true, settings };
    } catch (err) {
      console.error('Error saving settings:', err);
      
      // Still try to save to local storage even if Firestore fails
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      
      return { success: false, message: err.message };
    }
  },
  
  /**
   * Default settings as fallback
   */
  getDefaultSettings() {
    const defaultSettings = {
      questionsToUse: 20,
      timeLimit: 15,
      enableConfetti: true,
      createdAt: new Date().toISOString()
    };
    
    // Save defaults to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
    
    // Try to save to Firestore as well
    this.updateSettings(defaultSettings).catch(console.error);
    
    return defaultSettings;
  }
};