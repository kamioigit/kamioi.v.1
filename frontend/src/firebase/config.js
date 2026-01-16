// Firebase Configuration for Kamioi
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase config - using fallback values to prevent errors
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO123456"
};

// Check if using demo/placeholder values
const isUsingDemoConfig = firebaseConfig.apiKey === "demo-api-key" || 
                         firebaseConfig.projectId === "demo-project";

if (isUsingDemoConfig) {
  console.warn('⚠️ Firebase is using demo/placeholder configuration');
  console.log('📝 To enable Google authentication, please:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com/');
  console.log('2. Enable Google authentication in Firebase Console');
  console.log('3. Add your Firebase config to .env file');
  console.log('4. See FIREBASE_SETUP_GUIDE.md for detailed instructions');
}

// Initialize Firebase with error handling
let app = null;
let auth = null;
let db = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  // Initialize Analytics (optional)
  if (typeof window !== 'undefined' && firebaseConfig.apiKey !== 'demo-api-key') {
    analytics = getAnalytics(app);
  }
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
  console.log('📝 Using mock Firebase services for development');
  
  // Create mock services to prevent app crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
    signOut: () => Promise.resolve()
  };
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      })
    })
  };
}

export { auth, db, analytics };

// Development emulators (uncomment for local development)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;
