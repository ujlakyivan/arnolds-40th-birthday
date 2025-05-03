// User management service using Firebase Firestore
const UsersService = {
  /**
   * Get all users from Firestore
   */
  async getAllUsers() {
    try {
      // Wait for authentication
      await this.ensureAuth();
      
      // Get users collection
      const usersSnapshot = await db.collection('users').get();
      const users = [];
      
      usersSnapshot.forEach(doc => {
        // Don't include password hash in returned data
        const userData = doc.data();
        users.push({
          id: doc.id,
          username: userData.username,
          role: userData.role,
          createdAt: userData.createdAt
        });
      });
      
      return users;
    } catch (err) {
      console.error('Error getting users from Firestore:', err);
      
      // Fallback to local storage
      const localUsers = StorageUtils.getFromStorage('users', {});
      return Object.keys(localUsers).map(username => ({
        id: btoa(username), // Use base64 of username as ID
        username,
        role: localUsers[username].role,
        createdAt: localUsers[username].createdAt || new Date().toISOString()
      }));
    }
  },
  
  /**
   * Create a new user in Firestore
   */
  async createUser(username, password, role = 'user') {
    try {
      // Wait for authentication
      await this.ensureAuth();
      
      // Check if user already exists
      const existingUser = await db.collection('users')
        .where('username', '==', username)
        .get();
      
      if (!existingUser.empty) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Hash the password (basic, could use a better method)
      const passwordHash = btoa(`${username}:${password}`);
      
      // Create user in Firestore
      const userRef = await db.collection('users').add({
        username,
        passwordHash,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Also update local storage for offline mode
      const localUsers = StorageUtils.getFromStorage('users', {});
      localUsers[username] = {
        passwordHash,
        role,
        createdAt: new Date().toISOString()
      };
      StorageUtils.saveToStorage('users', localUsers);
      
      return { 
        success: true, 
        user: {
          id: userRef.id,
          username,
          role
        }
      };
    } catch (err) {
      console.error('Error creating user in Firestore:', err);
      
      // Fallback to local storage only
      const localUsers = StorageUtils.getFromStorage('users', {});
      
      // Check if user exists in local storage
      if (localUsers[username]) {
        return { success: false, message: 'Username already exists' };
      }
      
      // Add user to local storage
      const passwordHash = btoa(`${username}:${password}`);
      localUsers[username] = {
        passwordHash,
        role,
        createdAt: new Date().toISOString()
      };
      
      if (StorageUtils.saveToStorage('users', localUsers)) {
        return { 
          success: true, 
          user: {
            id: btoa(username),
            username,
            role
          }
        };
      }
      
      return { success: false, message: 'Failed to create user' };
    }
  },
  
  /**
   * Update an existing user
   */
  async updateUser(userId, updates) {
    try {
      // Wait for authentication
      await this.ensureAuth();
      
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return { success: false, message: 'User not found' };
      }
      
      const userData = userDoc.data();
      const updateData = { ...updates };
      
      // Hash password if provided
      if (updates.password) {
        updateData.passwordHash = btoa(`${userData.username}:${updates.password}`);
        delete updateData.password;
      }
      
      // Update in Firestore
      await userRef.update(updateData);
      
      // Update in local storage for offline mode
      const localUsers = StorageUtils.getFromStorage('users', {});
      
      if (localUsers[userData.username]) {
        if (updates.password) {
          localUsers[userData.username].passwordHash = updateData.passwordHash;
        }
        
        if (updates.role) {
          localUsers[userData.username].role = updates.role;
        }
        
        StorageUtils.saveToStorage('users', localUsers);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
      
      // Try local storage fallback
      const localUsers = StorageUtils.getFromStorage('users', {});
      const username = atob(userId).split(':')[0]; // Extract username from base64 ID
      
      if (!localUsers[username]) {
        return { success: false, message: 'User not found' };
      }
      
      // Update locally
      if (updates.password) {
        localUsers[username].passwordHash = btoa(`${username}:${updates.password}`);
      }
      
      if (updates.role) {
        localUsers[username].role = updates.role;
      }
      
      if (StorageUtils.saveToStorage('users', localUsers)) {
        return { success: true };
      }
      
      return { success: false, message: 'Failed to update user' };
    }
  },
  
  /**
   * Delete a user
   */
  async deleteUser(userId) {
    try {
      // Wait for authentication
      await this.ensureAuth();
      
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return { success: false, message: 'User not found' };
      }
      
      const userData = userDoc.data();
      
      // Delete from Firestore
      await userRef.delete();
      
      // Delete from local storage
      const localUsers = StorageUtils.getFromStorage('users', {});
      if (localUsers[userData.username]) {
        delete localUsers[userData.username];
        StorageUtils.saveToStorage('users', localUsers);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting user from Firestore:', err);
      
      // Try local storage fallback
      const localUsers = StorageUtils.getFromStorage('users', {});
      const username = atob(userId).split(':')[0]; // Extract username from base64 ID
      
      if (!localUsers[username]) {
        return { success: false, message: 'User not found' };
      }
      
      // Delete locally
      delete localUsers[username];
      
      if (StorageUtils.saveToStorage('users', localUsers)) {
        return { success: true };
      }
      
      return { success: false, message: 'Failed to delete user' };
    }
  },
  
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username, password) {
    try {
      // Wait for authentication
      await this.ensureAuth();
      
      // Check against Firestore
      const userSnapshot = await db.collection('users')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (userSnapshot.empty) {
        return { success: false, message: 'Invalid username or password' };
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      
      // Compare password hash
      const passwordHash = btoa(`${username}:${password}`);
      
      if (userData.passwordHash === passwordHash) {
        return {
          success: true,
          token: passwordHash,
          user: {
            id: userDoc.id,
            username: userData.username,
            role: userData.role
          }
        };
      }
      
      return { success: false, message: 'Invalid username or password' };
    } catch (err) {
      console.error('Error authenticating with Firestore:', err);
      
      // Fallback to local storage
      const localUsers = StorageUtils.getFromStorage('users', {});
      
      if (localUsers[username]) {
        const passwordHash = btoa(`${username}:${password}`);
        
        if (localUsers[username].passwordHash === passwordHash) {
          return {
            success: true,
            token: passwordHash,
            user: {
              id: btoa(username),
              username,
              role: localUsers[username].role
            }
          };
        }
      }
      
      return { success: false, message: 'Invalid username or password' };
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