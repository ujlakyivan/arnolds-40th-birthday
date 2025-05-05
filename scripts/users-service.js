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
      throw new Error('Failed to get users: ' + err.message);
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
      return { success: false, message: 'Failed to create user: ' + err.message };
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
      
      return { success: true };
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
      return { success: false, message: 'Failed to update user: ' + err.message };
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
      
      // Delete from Firestore
      await userRef.delete();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting user from Firestore:', err);
      return { success: false, message: 'Failed to delete user: ' + err.message };
    }
  },
  
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username, password) {
    try {
      // Try Firestore authentication
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
      return { success: false, message: 'Authentication failed: ' + err.message };
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
    
    // For admin operations that require authentication
    return Promise.reject(new Error('Authentication required'));
  }
};

// Explicitly attach to window object for global access
window.UsersService = UsersService;