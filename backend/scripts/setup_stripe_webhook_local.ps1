# Stripe Webhook Local Setup Script for Windows
# This script helps you set up Stripe CLI for local webhook testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stripe Webhook Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Stripe CLI is installed
Write-Host "Checking for Stripe CLI..." -ForegroundColor Yellow
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if (-not $stripeInstalled) {
    Write-Host "[ERROR] Stripe CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Stripe CLI:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://stripe.com/docs/stripe-cli" -ForegroundColor White
    Write-Host "2. Or use: scoop install stripe" -ForegroundColor White
    Write-Host "3. Or use: winget install stripe.stripe-cli" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Stripe CLI is installed" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Stripe login status..." -ForegroundColor Yellow
$stripeCheck = stripe config --list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Not logged in to Stripe CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To log in, run:" -ForegroundColor Yellow
    Write-Host "  stripe login" -ForegroundColor White
    Write-Host ""
    Write-Host "This will open your browser to authenticate." -ForegroundColor White
    Write-Host ""
    $login = Read-Host "Would you like to log in now? (y/n)"
    if ($login -eq "y" -or $login -eq "Y") {
        stripe login
    } else {
        Write-Host ""
        Write-Host "Please log in manually with: stripe login" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[OK] Logged in to Stripe CLI" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Webhook Listener" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will forward webhooks to: http://localhost:5111/api/stripe/webhook" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Keep this terminal window open while testing!" -ForegroundColor Yellow
Write-Host "You will see webhook events in real-time." -ForegroundColor White
Write-Host ""
Write-Host "When you see a webhook signing secret (whsec_...), copy it and:" -ForegroundColor Yellow
Write-Host "1. Add it to your .env file: STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
Write-Host "2. Restart your backend server" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the webhook listener" -ForegroundColor Yellow
Write-Host ""

# Start webhook listener
Write-Host "Starting Stripe webhook listener..." -ForegroundColor Green
Write-Host ""

stripe listen --forward-to localhost:5111/api/stripe/webhook


