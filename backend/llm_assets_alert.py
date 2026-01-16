#!/usr/bin/env python3
"""
LLM Assets Alert System - Sends alerts when calculations fail
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import subprocess
import sys

def send_alert(message):
    """Send an alert (customize this for your notification system)"""
    print(f"ALERT: {message}")
    # Add email, Slack, or other notification logic here

def check_and_alert():
    try:
        result = subprocess.run([sys.executable, 'llm_assets_health_check.py'], 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            send_alert("LLM Assets calculation validation failed!")
            print(result.stdout)
            print(result.stderr)
        else:
            print("LLM Assets calculation is healthy")
            
    except Exception as e:
        send_alert(f"Error checking LLM Assets: {e}")

if __name__ == "__main__":
    check_and_alert()
