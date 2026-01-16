// Enhanced Authentication Service for Kamioi
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
    });
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.loadUserProfile(result.user.uid);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (userData.displayName) {
        await updateProfile(result.user, {
          displayName: userData.displayName
        });
      }

      // Create user profile in Firestore
      await this.createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: userData.displayName || '',
        accountType: userData.accountType || 'individual',
        createdAt: new Date().toISOString(),
        settings: {
          roundUpAmount: 2.0,
          investmentPreference: 'moderate',
          notifications: true,
          ...userData.settings
        },
        profile: {
          riskTolerance: 'moderate',
          investmentGoals: [],
          ...userData.profile
        }
      });

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await this.createUserProfile(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName || '',
          accountType: 'individual',
          createdAt: new Date().toISOString(),
          settings: {
            roundUpAmount: 2.0,
            investmentPreference: 'moderate',
            notifications: true
          },
          profile: {
            riskTolerance: 'moderate',
            investmentGoals: []
          }
        });
      }

      await this.loadUserProfile(result.user.uid);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create user profile in Firestore
  async createUserProfile(userId, profileData) {
    try {
      await setDoc(doc(db, 'users', userId), profileData);
      this.userProfile = profileData;
      return { success: true };
    } catch (error) {
      console.error('Create profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load user profile from Firestore
  async loadUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        this.userProfile = userDoc.data();
        return { success: true, profile: this.userProfile };
      } else {
        console.warn('User profile not found');
        return { success: false, error: 'Profile not found' };
      }
    } catch (error) {
      console.error('Load profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      await updateDoc(doc(db, 'users', this.currentUser.uid), updates);
      this.userProfile = { ...this.userProfile, ...updates };
      return { success: true, profile: this.userProfile };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile() {
    return this.userProfile;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user is admin
  isAdmin() {
    return this.userProfile?.accountType === 'admin' || 
           this.userProfile?.role === 'admin';
  }

  // Get user's round-up setting
  getRoundUpSetting() {
    return this.userProfile?.settings?.roundUpAmount || 2.0;
  }

  // Update round-up setting
  async updateRoundUpSetting(amount) {
    return await this.updateUserProfile({
      'settings.roundUpAmount': amount
    });
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
