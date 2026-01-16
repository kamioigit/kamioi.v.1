#!/usr/bin/env python3

import os
import re

def fix_admin_tokens():
    """Fix all admin components to use kamioi_admin_token instead of kamioi_token"""
    
    frontend_path = r"C:\Users\beltr\100402025Kamioiv1\v10072025\frontend\src\components\admin"
    
    # Pattern to match the wrong token usage
    pattern = r"localStorage\.getItem\('kamioi_token'\)"
    replacement = "localStorage.getItem('kamioi_admin_token')"
    
    # Also handle cases with fallback tokens
    pattern2 = r"localStorage\.getItem\('kamioi_token'\) \|\| localStorage\.getItem\('authToken'\)"
    replacement2 = "localStorage.getItem('kamioi_admin_token')"
    
    files_fixed = 0
    
    # Walk through all JSX files in admin directory
    for root, dirs, files in os.walk(frontend_path):
        for file in files:
            if file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Fix simple kamioi_token usage
                    content = re.sub(pattern, replacement, content)
                    
                    # Fix kamioi_token with fallback
                    content = re.sub(pattern2, replacement2, content)
                    
                    # Only write if content changed
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed: {file_path}")
                        files_fixed += 1
                        
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
    
    print(f"\nFixed {files_fixed} files")
    return files_fixed

if __name__ == "__main__":
    fix_admin_tokens()
