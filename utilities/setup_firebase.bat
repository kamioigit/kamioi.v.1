@echo off
echo ============================================================
echo FIREBASE SETUP FOR GOOGLE AUTHENTICATION
echo ============================================================
echo.
echo Current Issue: Firebase is using demo/placeholder API key
echo Solution: Set up real Firebase project with Google authentication
echo.
echo STEP 1: Create Firebase Project
echo 1. Opening Firebase Console...
start https://console.firebase.google.com/
echo.
echo 2. Click "Create a project" or "Add project"
echo 3. Enter project name: "kamioi-app" (or your choice)
echo 4. Enable Google Analytics (optional)
echo 5. Click "Create project"
echo.
pause
echo.
echo STEP 2: Enable Google Authentication
echo 1. In Firebase Console, click "Authentication" in left sidebar
echo 2. Click "Get started"
echo 3. Go to "Sign-in method" tab
echo 4. Click on "Google" provider
echo 5. Toggle "Enable"
echo 6. Add your project support email
echo 7. Click "Save"
echo.
pause
echo.
echo STEP 3: Get Firebase Configuration
echo 1. In Firebase Console, click gear icon (Project settings)
echo 2. Scroll down to "Your apps" section
echo 3. Click "Add app" -^> Web app icon
echo 4. Enter app nickname: "kamioi-web"
echo 5. Click "Register app"
echo 6. COPY the Firebase configuration object
echo.
pause
echo.
echo STEP 4: Update .env file
echo Opening .env file for editing...
start notepad "frontend\.env"
echo.
echo Replace the placeholder values with your Firebase config:
echo VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-api-key
echo VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=your-project-id
echo VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
echo VITE_FIREBASE_APP_ID=1:123456789:web:abc123
echo VITE_FIREBASE_MEASUREMENT_ID=G-ABC123456
echo.
pause
echo.
echo STEP 5: Restart Development Server
echo 1. Stop current server (Ctrl+C)
echo 2. Start again: npm run dev
echo 3. Go to login page
echo 4. Click "Continue with Google"
echo 5. Google authentication should work!
echo.
echo VERIFICATION:
echo After restart, you should see:
echo - Firebase initialized successfully (no warnings)
echo - Google Auth Service initialized
echo - Google login button works without API key errors
echo.
echo SUCCESS!
echo Once configured, Google authentication will work perfectly!
echo.
pause
