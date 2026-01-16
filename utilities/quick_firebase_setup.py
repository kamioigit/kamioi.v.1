#!/usr/bin/env python3
"""
Quick Firebase Setup for Google Authentication
This script will help you set up Firebase in under 5 minutes
"""

import os
import webbrowser
import subprocess
import sys

def main():
    print("=" * 60)
    print("QUICK FIREBASE SETUP FOR GOOGLE AUTHENTICATION")
    print("=" * 60)
    print()
    print("Current Status: Firebase is using demo/placeholder API key")
    print("Solution: Set up real Firebase project with Google authentication")
    print()
    
    # Check if .env file exists
    env_file = "frontend/.env"
    env_example = "frontend/.env.example"
    
    if os.path.exists(env_file):
        print("Found existing .env file")
        with open(env_file, 'r') as f:
            content = f.read()
            if "demo-api-key" in content or "your-api-key-here" in content:
                print("WARNING: .env file contains placeholder values")
                print("You need to replace them with real Firebase credentials")
            else:
                print("INFO: .env file exists and may contain real values")
    else:
        print("No .env file found - will create one from template")
    
    print()
    print("STEP-BY-STEP SETUP:")
    print("-" * 30)
    print()
    
    print("STEP 1: Create Firebase Project")
    print("1. I'll open Firebase Console for you")
    print("2. Click 'Create a project' or 'Add project'")
    print("3. Enter project name: 'kamioi-app' (or your choice)")
    print("4. Enable Google Analytics (optional)")
    print("5. Click 'Create project'")
    print()
    
    input("Press Enter when ready to open Firebase Console...")
    webbrowser.open("https://console.firebase.google.com/")
    
    print()
    print("STEP 2: Enable Google Authentication")
    print("1. In Firebase Console, click 'Authentication' in left sidebar")
    print("2. Click 'Get started'")
    print("3. Go to 'Sign-in method' tab")
    print("4. Click on 'Google' provider")
    print("5. Toggle 'Enable'")
    print("6. Add your project support email")
    print("7. Click 'Save'")
    print()
    
    input("Press Enter when Google authentication is enabled...")
    
    print()
    print("STEP 3: Get Firebase Configuration")
    print("1. In Firebase Console, click gear icon (Project settings)")
    print("2. Scroll down to 'Your apps' section")
    print("3. Click 'Add app' -> Web app icon")
    print("4. Enter app nickname: 'kamioi-web'")
    print("5. Check 'Also set up Firebase Hosting' (optional)")
    print("6. Click 'Register app'")
    print("7. COPY the Firebase configuration object")
    print()
    
    input("Press Enter when you have copied the Firebase config...")
    
    print()
    print("STEP 4: Create .env file")
    
    # Create .env file from template
    if not os.path.exists(env_file):
        if os.path.exists(env_example):
            print("Creating .env file from template...")
            with open(env_example, 'r') as f:
                template_content = f.read()
            with open(env_file, 'w') as f:
                f.write(template_content)
            print("Created .env file from template")
        else:
            print("Creating .env file...")
            env_content = """# Firebase Configuration
# Replace these placeholder values with your actual Firebase project values

VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
"""
            with open(env_file, 'w') as f:
                f.write(env_content)
            print("Created .env file with template")
    
    print()
    print("STEP 5: Update .env file with your Firebase config")
    print("1. Open frontend/.env file in your text editor")
    print("2. Replace the placeholder values with your Firebase config")
    print("3. Save the file")
    print()
    
    print("Your .env file should look like this:")
    print("-" * 40)
    print("VITE_FIREBASE_API_KEY=AIzaSyC...")
    print("VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com")
    print("VITE_FIREBASE_PROJECT_ID=your-project-id")
    print("VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com")
    print("VITE_FIREBASE_MESSAGING_SENDER_ID=123456789")
    print("VITE_FIREBASE_APP_ID=1:123456789:web:abc123")
    print("VITE_FIREBASE_MEASUREMENT_ID=G-ABC123456")
    print("-" * 40)
    print()
    
    input("Press Enter when you have updated the .env file...")
    
    print()
    print("STEP 6: Restart Development Server")
    print("1. Stop the current development server (Ctrl+C)")
    print("2. Start it again: npm run dev")
    print("3. Go to login page")
    print("4. Click 'Continue with Google'")
    print("5. Google authentication should work now!")
    print()
    
    print("VERIFICATION:")
    print("-" * 20)
    print("After restart, you should see:")
    print("✅ Firebase initialized successfully (no warnings)")
    print("✅ Google Auth Service initialized")
    print("✅ Google login button works without API key errors")
    print()
    
    print("TROUBLESHOOTING:")
    print("-" * 20)
    print("If you still get API key errors:")
    print("1. Check that .env file has real Firebase values (not placeholders)")
    print("2. Make sure you restarted the development server")
    print("3. Check browser console for any error messages")
    print("4. Verify Firebase project has Google authentication enabled")
    print()
    
    print("SUCCESS!")
    print("=" * 20)
    print("Once configured, Google authentication will work perfectly!")
    print("Users can sign in with their Google accounts seamlessly.")
    print()
    
    # Try to open the .env file for editing
    try:
        if os.path.exists(env_file):
            print(f"Opening {env_file} for editing...")
            if sys.platform == "win32":
                os.startfile(env_file)
            elif sys.platform == "darwin":
                subprocess.run(["open", env_file])
            else:
                subprocess.run(["xdg-open", env_file])
    except Exception as e:
        print(f"Could not auto-open .env file: {e}")
        print(f"Please manually open: {os.path.abspath(env_file)}")

if __name__ == "__main__":
    main()
