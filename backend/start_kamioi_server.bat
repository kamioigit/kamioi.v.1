@echo off
echo Starting Kamioi Backend Server...
cd /d "C:\Users\beltr\Kamioi\backend"
call .venv\Scripts\activate
py app.py
pause
