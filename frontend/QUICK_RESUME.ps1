# Quick Resume Script - Run this to see current status
Write-Host "=== Syntax Error Fix Status ===" -ForegroundColor Cyan
Write-Host ""

# Count errors
Write-Host "Checking current error count..." -ForegroundColor Yellow
$errorCount = npm run lint 2>&1 | Select-String -Pattern "^\s*\d+:\d+\s+error" | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Current Errors: $errorCount" -ForegroundColor $(if ($errorCount -lt 250) { "Green" } else { "Red" })
Write-Host ""

# Show top 10 errors
Write-Host "Top 10 Errors:" -ForegroundColor Yellow
npm run lint 2>&1 | Select-String -Pattern "^\s*\d+:\d+\s+error" | Select-Object -First 10
Write-Host ""

# Check if scripts exist
Write-Host "Available Scripts:" -ForegroundColor Yellow
if (Test-Path "fix-isLightMode.ps1") { Write-Host "  ✅ fix-isLightMode.ps1" -ForegroundColor Green }
if (Test-Path "fix-icons.ps1") { Write-Host "  ✅ fix-icons.ps1" -ForegroundColor Green }
Write-Host ""
Write-Host "To continue fixing, run:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File fix-icons.ps1" -ForegroundColor White
Write-Host ""

