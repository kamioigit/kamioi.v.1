# ============================================
# Kamioi Project Cleanup Script
# ============================================
# This script removes build artifacts, cache files, and unnecessary directories
# Run this BEFORE creating Kamioi.2 to see what can be safely removed
# 
# WARNING: This script will DELETE files. Make sure you have a backup!
# ============================================

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kamioi Project Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Force) {
    Write-Host "WARNING: This script will DELETE files and directories!" -ForegroundColor Red
    Write-Host "Make sure you have a backup of your project." -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Type 'YES' to continue (or use -Force flag)"
    if ($confirm -ne "YES") {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit
    }
}

$projectRoot = $PSScriptRoot
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Write-Host "Project Root: $projectRoot" -ForegroundColor Green
Write-Host "Dry Run Mode: $DryRun" -ForegroundColor $(if ($DryRun) { "Yellow" } else { "Green" })
Write-Host ""

$totalSizeFreed = 0
$itemsRemoved = 0

function Remove-ItemSafely {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        
        if ($size) {
            $sizeMB = [math]::Round($size / 1MB, 2)
            Write-Host "  Found: $Description" -ForegroundColor Yellow
            Write-Host "    Path: $Path" -ForegroundColor Gray
            Write-Host "    Size: $sizeMB MB" -ForegroundColor Gray
            
            if (-not $DryRun) {
                try {
                    Remove-Item $Path -Recurse -Force -ErrorAction Stop
                    Write-Host "    ✓ Removed" -ForegroundColor Green
                    $script:totalSizeFreed += $size
                    $script:itemsRemoved++
                } catch {
                    Write-Host "    ✗ Error: $_" -ForegroundColor Red
                }
            } else {
                Write-Host "    [DRY RUN] Would remove" -ForegroundColor Cyan
                $script:totalSizeFreed += $size
                $script:itemsRemoved++
            }
        }
    }
}

function Remove-PatternSafely {
    param(
        [string]$Pattern,
        [string]$Description,
        [string]$RootPath = $projectRoot
    )
    
    Write-Host "Searching for: $Description" -ForegroundColor Cyan
    
    $items = Get-ChildItem -Path $RootPath -Recurse -Directory -ErrorAction SilentlyContinue | 
             Where-Object { $_.Name -eq $Pattern }
    
    foreach ($item in $items) {
        Remove-ItemSafely -Path $item.FullName -Description "$Description ($($item.FullName))"
    }
}

# ============================================
# Cleanup Operations
# ============================================

Write-Host "Starting cleanup operations..." -ForegroundColor Cyan
Write-Host ""

# 1. Remove Python cache directories
Remove-PatternSafely -Pattern "__pycache__" -Description "Python cache directories"

# 2. Remove node_modules (except frontend)
Write-Host "Searching for: node_modules directories (excluding frontend)" -ForegroundColor Cyan
$nodeModules = Get-ChildItem -Path $projectRoot -Recurse -Directory -ErrorAction SilentlyContinue | 
               Where-Object { $_.Name -eq "node_modules" -and $_.FullName -notlike "*\frontend\node_modules*" }
foreach ($item in $nodeModules) {
    Remove-ItemSafely -Path $item.FullName -Description "node_modules (outside frontend)"
}

# 3. Remove build directories
Remove-PatternSafely -Pattern "build" -Description "Build directories"
Remove-PatternSafely -Pattern "dist" -Description "Dist directories"

# 4. Remove bin/obj directories (C# build artifacts)
Remove-PatternSafely -Pattern "bin" -Description "Bin directories"
Remove-PatternSafely -Pattern "obj" -Description "Obj directories"

# 5. Remove virtual environments (except one)
Write-Host "Searching for: Virtual environments" -ForegroundColor Cyan
$venvPaths = @(
    "$projectRoot\backend\kamioi_venv",
    "$projectRoot\backend\venv",
    "$projectRoot\venv"
)
foreach ($venvPath in $venvPaths) {
    if (Test-Path $venvPath) {
        Write-Host "  Note: Found venv at $venvPath" -ForegroundColor Yellow
        Write-Host "    Consider keeping only one venv. Remove manually if needed." -ForegroundColor Gray
    }
}

# 6. Remove old backup directories
Write-Host "Searching for: Backup directories" -ForegroundColor Cyan
$backupDirs = Get-ChildItem -Path $projectRoot -Recurse -Directory -ErrorAction SilentlyContinue | 
              Where-Object { $_.Name -like "backup_*" -or $_.Name -like "*backup*" }
foreach ($item in $backupDirs) {
    Remove-ItemSafely -Path $item.FullName -Description "Backup directory"
}

# 7. Remove .pytest_cache
Remove-PatternSafely -Pattern ".pytest_cache" -Description "Pytest cache"

# 8. Remove log files
Write-Host "Searching for: Log files" -ForegroundColor Cyan
$logFiles = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Extension -eq ".log" -or $_.Name -like "*.log" }
foreach ($item in $logFiles) {
    Remove-ItemSafely -Path $item.FullName -Description "Log file"
}

# 9. Remove temporary files
Write-Host "Searching for: Temporary files" -ForegroundColor Cyan
$tempFiles = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue | 
             Where-Object { $_.Extension -in @(".tmp", ".temp", ".bak", ".backup", ".old") }
foreach ($item in $tempFiles) {
    Remove-ItemSafely -Path $item.FullName -Description "Temporary file"
}

# 10. Remove .pyc files
Write-Host "Searching for: .pyc files" -ForegroundColor Cyan
$pycFiles = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Extension -eq ".pyc" }
$pycCount = $pycFiles.Count
if ($pycCount -gt 0) {
    $pycSize = ($pycFiles | Measure-Object -Property Length -Sum).Sum
    $pycSizeMB = [math]::Round($pycSize / 1MB, 2)
    Write-Host "  Found: $pycCount .pyc files ($pycSizeMB MB)" -ForegroundColor Yellow
    
    if (-not $DryRun) {
        foreach ($file in $pycFiles) {
            try {
                Remove-Item $file.FullName -Force -ErrorAction Stop
                $script:itemsRemoved++
            } catch {
                Write-Host "    ✗ Error removing $($file.FullName): $_" -ForegroundColor Red
            }
        }
        Write-Host "    ✓ Removed $pycCount .pyc files" -ForegroundColor Green
    } else {
        Write-Host "    [DRY RUN] Would remove $pycCount .pyc files" -ForegroundColor Cyan
    }
    $script:totalSizeFreed += $pycSize
}

# ============================================
# Summary
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Items processed: $itemsRemoved" -ForegroundColor Green
Write-Host "Space that would be freed: $([math]::Round($totalSizeFreed / 1GB, 2)) GB" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "This was a DRY RUN. No files were actually deleted." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to actually remove files." -ForegroundColor Yellow
} else {
    Write-Host "Cleanup complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md" -ForegroundColor White
Write-Host "2. Create Kamioi.2 with the recommended structure" -ForegroundColor White
Write-Host "3. Migrate your code following the migration plan" -ForegroundColor White
Write-Host ""

