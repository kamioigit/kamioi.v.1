# PowerShell script to start Flask server with PostgreSQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Kamioi Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:DB_TYPE = "postgresql"
$env:PORT = "5111"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Database: PostgreSQL" -ForegroundColor Green
Write-Host "  Port: 5111" -ForegroundColor Green
Write-Host "  Host: localhost:5432" -ForegroundColor Green
Write-Host ""

# Change to backend directory
Set-Location $PSScriptRoot

# Start the Flask app
Write-Host "Starting Flask server..." -ForegroundColor Yellow
Write-Host ""
python app.py

