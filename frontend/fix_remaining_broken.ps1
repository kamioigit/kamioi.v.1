# Fix remaining broken template literals - fetch(\${apiBaseUrl} pattern

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
        # But we need to check if apiBaseUrl is defined first
        $lines = $content -split "`n"
        $newLines = @()
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            
            # Check if line has fetch(\${apiBaseUrl}
            if ($line -match "fetch\(\\\$\{apiBaseUrl") {
                # Check previous lines in this function for apiBaseUrl definition
                $prevContext = ($lines[0..($i-1)] -join "`n")
                if ($prevContext -notmatch "const apiBaseUrl = import\.meta\.env\.VITE_API_BASE_URL") {
                    # Find function start to add apiBaseUrl
                    $functionStart = $i
                    for ($j = $i - 1; $j -ge 0; $j--) {
                        if ($lines[$j] -match "(async\s+)?(function|const|let|var)\s+\w+\s*[=\(]|^\s*try\s*\{") {
                            $functionStart = $j
                            break
                        }
                    }
                    
                    # Get indent from current line
                    $indent = ""
                    if ($line -match "^\s+") {
                        $indent = $matches[0]
                    }
                    
                    # Add apiBaseUrl definition before this line
                    $newLines += "$indent      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
                }
                
                # Fix the fetch call
                $line = $line -replace "fetch\(\\\$\{apiBaseUrl", "fetch(\`${apiBaseUrl"
            }
            
            $newLines += $line
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

