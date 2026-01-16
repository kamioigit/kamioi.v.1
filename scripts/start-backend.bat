@echo off
echo 🚀 Starting Kamioi Platform v10072025 Backend...
echo.

cd /d "%~dp0..\backend"

echo 📦 Activating Python Virtual Environment...
call venv\Scripts\activate

echo 🐍 Starting Flask Backend Server...
echo 📊 Backend will be available at: http://localhost:5000
echo 🔗 Health Check: http://localhost:5000/api/health
echo.

python simple_app.py

pause
