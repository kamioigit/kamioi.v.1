# Final fix for all broken template literals
# Fixes: fetch(\${apiBaseUrl} and removes duplicate apiBaseUrl definitions

$frontendDir = "C:\Users\beltr\Kamioi\frontend\src"
$files = Get-ChildItem -Path $frontendDir -Recurse -Include *.jsx,*.js | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*.backup.*" -and
    $_.FullName -notlike "*_BROKEN.*"
}

$count = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $original = $content
        
        # Fix: fetch(\${apiBaseUrl} -> fetch(`${apiBaseUrl}
        $content = $content -replace 'fetch\(\\\$\{apiBaseUrl', 'fetch(`${apiBaseUrl'
        
        # Fix: fetchWithTimeout(\${apiBaseUrl} -> fetchWithTimeout(`${apiBaseUrl}
        $content = $content -replace 'fetchWithTimeout\(\\\$\{apiBaseUrl', 'fetchWithTimeout(`${apiBaseUrl'
        
        # Fix: !== ${import.meta.env... -> !== `${import.meta.env...
        $content = $content -replace '!== \$\{import\.meta\.env', '!== `${import.meta.env'
        
        # Remove duplicate apiBaseUrl definitions (lines that have the same definition twice in a row)
        $lines = $content -split "`n"
        $newLines = @()
        $prevLine = ""
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            $isDuplicate = $false
            
            # Check if this line and previous line both define apiBaseUrl
            if ($line -match "^\s*const apiBaseUrl = import\.meta\.env\.VITE_API_BASE_URL" -and 
                $prevLine -match "^\s*const apiBaseUrl = import\.meta\.env\.VITE_API_BASE_URL") {
                $isDuplicate = $true
            }
            
            if (-not $isDuplicate) {
                $newLines += $line
            } else {
                Write-Host "Removed duplicate apiBaseUrl in $($file.Name) at line $($i+1)" -ForegroundColor Yellow
            }
            
            $prevLine = $line
        }
        
        $content = $newLines -join "`n"
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline -ErrorAction Stop
            $count++
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error in $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTotal files fixed: $count" -ForegroundColor Cyan

