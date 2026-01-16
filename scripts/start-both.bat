@echo off
echo 🚀 Starting Kamioi Platform v10072025 - Both Servers...
echo.

echo 📦 Starting Backend Server...
start "Kamioi Backend" cmd /k "cd /d %~dp0..\backend && call venv\Scripts\activate && python simple_app.py"

timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Server...
start "Kamioi Frontend" cmd /k "cd /d %~dp0..\frontend && call npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📊 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3119
echo.
echo Press any key to exit...
pause >nul
