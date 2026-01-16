#!/usr/bin/env python3
"""
Fix Unicode characters in app.py
"""
import re

def fix_unicode():
    # Read the file
    with open('c:/Users/beltr/100402025Kamioiv1/v10072025/backend/app.py', 'rb') as f:
        content = f.read()
    
    # Convert to string, ignoring problematic characters
    try:
        text = content.decode('utf-8', errors='ignore')
    except:
        text = content.decode('latin-1', errors='ignore')
    
    # Find and replace Unicode emojis
    replacements = {
        '🧠': '',
        '📊': '',
        '🎯': '',
        '⚙️': '',
        '🚀': '',
        '✅': '',
        '❌': '',
        '⚠️': '',
        '📈': '',
        '💾': '',
        '🔧': '',
        '📋': '',
        '🧠 ': '',
        '📊 ': '',
        '🎯 ': '',
        '⚙️ ': '',
        '🚀 ': '',
        '✅ ': '',
        '❌ ': '',
        '⚠️ ': '',
        '📈 ': '',
        '💾 ': '',
        '🔧 ': '',
        '📋 ': ''
    }
    
    # Apply replacements
    for unicode_char, replacement in replacements.items():
        text = text.replace(unicode_char, replacement)
    
    # Write back to file
    with open('c:/Users/beltr/100402025Kamioiv1/v10072025/backend/app.py', 'w', encoding='utf-8') as f:
        f.write(text)
    
    print("Unicode characters removed from app.py")

if __name__ == "__main__":
    fix_unicode()


