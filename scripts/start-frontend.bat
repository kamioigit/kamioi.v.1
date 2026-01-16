@echo off
echo 🎨 Starting Kamioi Platform v10072025 Frontend...
echo.

cd /d "%~dp0..\frontend"

echo 📦 Installing dependencies (if needed)...
call npm install

echo 🚀 Starting React Frontend Server...
echo 🌐 Frontend will be available at: http://localhost:3119
echo.

call npm run dev

pause


