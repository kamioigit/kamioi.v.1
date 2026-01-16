#!/usr/bin/env python3
"""
Script to switch between single-session and multi-session authentication systems
"""

import os
import shutil

def switch_to_multi_session():
    """Switch to multi-session authentication system"""
    print("Switching to Multi-Session Authentication System...")
    
    # Backup current App.jsx
    if os.path.exists('frontend/src/App.jsx'):
        shutil.copy('frontend/src/App.jsx', 'frontend/src/App_single_session.jsx')
        print("Backed up current App.jsx to App_single_session.jsx")
    
    # Replace App.jsx with multi-session version
    if os.path.exists('frontend/src/AppMultiSession.jsx'):
        shutil.copy('frontend/src/AppMultiSession.jsx', 'frontend/src/App.jsx')
        print("Switched to multi-session App.jsx")
    else:
        print("AppMultiSession.jsx not found")
        return False
    
    print("Multi-session authentication system activated!")
    print("Features:")
    print("   - Login as multiple user types simultaneously")
    print("   - Session switcher in top-right corner")
    print("   - No need to logout between user types")
    print("   - Perfect for testing and development")
    return True

def switch_to_single_session():
    """Switch back to single-session authentication system"""
    print("Switching to Single-Session Authentication System...")
    
    # Restore original App.jsx
    if os.path.exists('frontend/src/App_single_session.jsx'):
        shutil.copy('frontend/src/App_single_session.jsx', 'frontend/src/App.jsx')
        print("Restored single-session App.jsx")
    else:
        print("App_single_session.jsx not found")
        return False
    
    print("Single-session authentication system activated!")
    print("Features:")
    print("   - Traditional single-user authentication")
    print("   - Must logout to switch user types")
    print("   - Production-ready security model")
    return True

def main():
    print("Kamioi Authentication System Switcher")
    print("=" * 50)
    print("1. Switch to Multi-Session (Testing/Development)")
    print("2. Switch to Single-Session (Production)")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        switch_to_multi_session()
    elif choice == '2':
        switch_to_single_session()
    elif choice == '3':
        print("Goodbye!")
    else:
        print("Invalid choice")

if __name__ == '__main__':
    main()
