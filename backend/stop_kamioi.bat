@echo off
echo ========================================
echo Stopping Kamioi Backend (ISOLATED)
echo ========================================
echo Killing any Python processes running from this directory...

REM Kill processes by port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5111"') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)

REM Kill any Python processes that might be running this app
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr "python.exe"') do (
    echo Checking Python process %%a
    wmic process where "ProcessId=%%a" get CommandLine /format:list | findstr "app.py" >nul
    if not errorlevel 1 (
        echo Killing Kamioi Python process %%a
        taskkill /PID %%a /F 2>nul
    )
)

echo ========================================
echo Kamioi Backend stopped
echo ========================================
pause
