@echo off
echo 🚀 Starting Kamioi Platform Development Environment
echo.

echo 📦 Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0..\backend && python app.py"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🎨 Starting Frontend Server (Port 3764)...
start "Frontend Server" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo ✅ Development servers started!
echo 🌐 Frontend: http://localhost:3764
echo 🔧 Backend: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/api/health
echo.
echo Press any key to exit...
pause > nul

