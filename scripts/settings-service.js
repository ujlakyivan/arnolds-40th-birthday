// Settings service for cloud storage with Firebase
const SettingsService = {
  /**
   * Get settings from Firestore
   */
  async getSettings() {
    try {
      // Try to get from Firestore - no auth check needed for reading settings
      try {
        const doc = await db.collection('settings').doc('global').get();
        
        if (doc.exists) {
          console.log('Settings loaded from Firestore');
          return doc.data();
        }
      } catch (firebaseErr) {
        console.warn('Could not access Firestore settings - using defaults:', firebaseErr.message);
        // If we get a permission error, just use default settings
        // This allows the app to function without changing Firestore rules
      }
      
      // If no settings exist or permissions error, use default settings
      const defaultSettings = this.getDefaultSettings();
      console.log('Using default settings');
      return defaultSettings;
    } catch (err) {
      console.error('Error in settings service:', err);
      // Always return default settings as fallback
      return this.getDefaultSettings();
    }
  },
  
  /**
   * Update settings in Firestore
   */
  async updateSettings(settings) {
    try {
      // Check if we have auth info before attempting to write
      const authInfo = JSON.parse(sessionStorage.getItem('authInfo'));
      
      if (!authInfo || !authInfo.token) {
        console.error('Authentication required to update settings');
        return { success: false, message: 'Authentication required' };
      }
      
      // Save to Firestore
      await db.collection('settings').doc('global').set(settings);
      
      return { success: true, settings };
    } catch (err) {
      console.error('Error saving settings:', err);
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
      completionThreshold: 90,
      createdAt: new Date().toISOString()
    };
    
    return defaultSettings;
  }
};

// Explicitly attach to window object for global access
window.SettingsService = SettingsService;