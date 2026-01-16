#!/usr/bin/env python3
"""
Simple LLM Assets Monitor - Run this script regularly to check calculation health
"""

import subprocess
import sys
import os

def run_health_check():
    try:
        # Change to the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        # Run the health check
        result = subprocess.run([sys.executable, 'llm_assets_health_check.py'], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"Error running health check: {e}")
        return False

if __name__ == "__main__":
    success = run_health_check()
    sys.exit(0 if success else 1)
