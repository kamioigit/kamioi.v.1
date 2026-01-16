@echo off
cd /d "C:\Users\beltr\Kamioi\backend"
set FLASK_APP=app.py
set FLASK_ENV=development
flask run --host=127.0.0.1 --port=5111
pause
