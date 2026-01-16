@echo off
REM Verification and restart script
REM This verifies the database is clean before starting servers

echo ========================================
echo Kamioi - Database Verification & Start
echo ========================================
echo.

REM Verify database is clean
echo [1/3] Verifying database state...
cd /d C:\Users\beltr\Kamioi\backend
python verify_clean_state.py

echo.
echo [2/3] Starting backend server...
start "Kamioi Backend" cmd /k "cd /d C:\Users\beltr\Kamioi\backend && python app.py"

REM Wait for backend to initialize
timeout /t 3 /nobreak >nul

echo [3/3] Starting frontend server...
start "Kamioi Frontend" cmd /k "cd /d C:\Users\beltr\Kamioi\frontend && npm run dev"

echo.
echo ========================================
echo Servers started!
echo ========================================
echo.
echo Next steps:
echo 1. Hard refresh all browser pages (Ctrl + Shift + R)
echo 2. Verify these pages show 0 transactions:
echo    - Platform Overview
echo    - Transactions
echo    - Database Management
echo.
pause


