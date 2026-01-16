# Find process locking the database
$dbFile = "C:\Users\beltr\Kamioi\backend\kamioi.db"
$walFile = "C:\Users\beltr\Kamioi\backend\kamioi.db-wal"
$shmFile = "C:\Users\beltr\Kamioi\backend\kamioi.db-shm"

Write-Host "Searching for processes locking database files..."
Write-Host ""

# Check Python processes
$pythonProcs = Get-Process | Where-Object {$_.ProcessName -like "*python*"}
if ($pythonProcs) {
    Write-Host "Python processes found:"
    foreach ($proc in $pythonProcs) {
        Write-Host "  PID $($proc.Id): $($proc.ProcessName) - $($proc.Path)"
        try {
            $files = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Modules -ErrorAction SilentlyContinue
            if ($files) {
                $dbFiles = $files | Where-Object {$_.FileName -like "*kamioi.db*"}
                if ($dbFiles) {
                    Write-Host "    -> Has database file open!"
                }
            }
        } catch {
            # Ignore access denied errors
        }
    }
} else {
    Write-Host "No Python processes found"
}

Write-Host ""
Write-Host "Checking for SQLite browsers..."
$sqliteBrowsers = Get-Process | Where-Object {
    $_.ProcessName -like "*sqlite*" -or
    $_.ProcessName -like "*db*" -or
    $_.ProcessName -like "*browser*"
}
if ($sqliteBrowsers) {
    Write-Host "Possible SQLite browsers found:"
    foreach ($proc in $sqliteBrowsers) {
        Write-Host "  PID $($proc.Id): $($proc.ProcessName) - $($proc.Path)"
    }
} else {
    Write-Host "No obvious SQLite browsers found"
}

Write-Host ""
Write-Host "To kill a Python process, run:"
Write-Host "  Stop-Process -Id <PID> -Force"
Write-Host ""
Write-Host "To kill all Python processes (CAREFUL!):"
Write-Host "  Get-Process python | Stop-Process -Force"


