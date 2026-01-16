@echo off
REM Startup script for Kamioi backend and frontend
REM This opens two separate command windows for each server

echo Starting Kamioi servers...
echo.

REM Start backend in new window
start "Kamioi Backend" cmd /k "cd /d C:\Users\beltr\Kamioi\backend && python app.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in new window
start "Kamioi Frontend" cmd /k "cd /d C:\Users\beltr\Kamioi\frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.
echo After servers start:
echo 1. Hard refresh all browser pages (Ctrl + Shift + R)
echo 2. Verify pages show 0 transactions
echo 3. Run: python verify_clean_state.py (in backend folder) if needed
echo.
pause


