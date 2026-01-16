# Backup Script for Kamioi Project
# Creates a backup copy before Next.js migration

$sourcePath = "C:\Users\beltr\Kamioi"
$backupPath = "C:\Users\beltr\Kamioi-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Creating backup of Kamioi project..."
Write-Host "Source: $sourcePath"
Write-Host "Backup: $backupPath"

# Exclude node_modules and other large folders to speed up backup
$excludeDirs = @('node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache', '*.pyc')

try {
    # Use robocopy for efficient copying (Windows built-in)
    robocopy $sourcePath $backupPath /E /XD node_modules .git dist build __pycache__ .pytest_cache /XF *.pyc /R:1 /W:1 /NP /NFL /NDL
    
    Write-Host ""
    Write-Host "✅ Backup created successfully!"
    Write-Host "Backup location: $backupPath"
    Write-Host ""
    Write-Host "You can now proceed with Next.js migration."
    Write-Host "Original project is safe at: $sourcePath"
} catch {
    Write-Host "❌ Error creating backup: $_"
    Write-Host ""
    Write-Host "Alternative: Use Windows File Explorer to manually copy the folder"
}

