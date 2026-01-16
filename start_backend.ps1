# Start Kamioi Backend Server
Write-Host "Starting Kamioi Backend Server..."

# Navigate to backend directory
Set-Location "C:\Users\beltr\100402025Kamioiv1\v10072025\backend"

# Activate virtual environment
Write-Host "Activating virtual environment..."
& .\.venv\Scripts\Activate.ps1

# Start the Flask app
Write-Host "Starting Flask application..."
python app.py


