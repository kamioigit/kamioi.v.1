# PowerShell script to find frontend API configuration files
# Run this from the Kamioi root directory

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Finding Frontend API Configuration Files" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

$kamioiRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $kamioiRoot "frontend"

if (Test-Path $frontendPath) {
    Write-Host "Frontend directory found: $frontendPath" -ForegroundColor Green
    Write-Host ""
    
    # Search for common config files
    Write-Host "Searching for configuration files..." -ForegroundColor Yellow
    
    # .env files
    Write-Host "`n.env files:" -ForegroundColor Cyan
    Get-ChildItem -Path $frontendPath -Filter ".env*" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor White
        Select-String -Path $_.FullName -Pattern "4000|API|BASE" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
    }
    
    # Config files
    Write-Host "`nConfig files:" -ForegroundColor Cyan
    Get-ChildItem -Path $frontendPath -Filter "*config*.js" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor White
        Select-String -Path $_.FullName -Pattern "4000|API|BASE" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
    }
    
    # API service files
    Write-Host "`nAPI service files:" -ForegroundColor Cyan
    Get-ChildItem -Path $frontendPath -Filter "*api*.js" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor White
        Select-String -Path $_.FullName -Pattern "4000|127\.0\.0\.1" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
    }
    
    # Search for hardcoded port 4000
    Write-Host "`nFiles containing '4000':" -ForegroundColor Cyan
    Get-ChildItem -Path $frontendPath -Include "*.js","*.jsx","*.ts","*.tsx" -Recurse -ErrorAction SilentlyContinue | 
        Select-String -Pattern ":4000|localhost:4000|127\.0\.0\.1:4000" -ErrorAction SilentlyContinue | 
        Group-Object Path | ForEach-Object {
            Write-Host "  $($_.Name)" -ForegroundColor White
            $_.Group | ForEach-Object {
                Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
            }
        }
    
} else {
    Write-Host "Frontend directory not found at: $frontendPath" -ForegroundColor Red
    Write-Host "Please run this script from the Kamioi backend directory" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "Search complete!" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

