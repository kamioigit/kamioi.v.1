@echo off
echo ========================================
echo Starting Kamioi Backend (ISOLATED)
echo ========================================
cd /d "C:\Users\beltr\Kamioi\backend"
call kamioi_venv\Scripts\activate
echo Using isolated Python environment: kamioi_venv
echo Python version:
python --version
echo.
echo Starting Flask server on port 5111...
echo Press Ctrl+C to stop
echo ========================================
python app.py
