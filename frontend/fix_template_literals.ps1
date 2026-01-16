# Fix incorrect template literal patterns in frontend files
# Replaces '${import.meta.env... with proper template literals

$frontendDir = "C:\Users\beltr\Kamioi\frontend\src"
$files = Get-ChildItem -Path $frontendDir -Recurse -Include *.jsx,*.js | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*.backup.*" -and
    $_.FullName -notlike "*_BROKEN.*"
}

$count = 0
$errors = @()

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $original = $content
        
        # Pattern 1: Replace '${import.meta.env... with proper template literal
        # This handles cases like: fetch('${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/...')
        $content = $content -replace "('`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\})", "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
        
        # Pattern 2: Replace standalone strings that need to be template literals
        # But we need to be careful - only replace in fetch calls and similar contexts
        # For now, let's do a more targeted replacement
        
        # Replace fetch('${import.meta.env... with fetch(`${apiBaseUrl}... where apiBaseUrl is defined
        # This is complex, so let's do it line by line
        $lines = $content -split "`n"
        $newLines = @()
        $inFunction = $false
        $hasApiBaseUrl = $false
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i]
            $originalLine = $line
            
            # Check if line contains the incorrect pattern
            if ($line -match "'`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}") {
                # Check if we're in a function and if apiBaseUrl is already defined
                $prevLines = $lines[0..($i-1)] -join "`n"
                if ($prevLines -notmatch "const apiBaseUrl = import\.meta\.env\.VITE_API_BASE_URL") {
                    # Add apiBaseUrl definition before this line (find the function start)
                    $functionStart = $i
                    for ($j = $i - 1; $j -ge 0; $j--) {
                        if ($lines[$j] -match "(async\s+)?(function|const|let|var)\s+\w+\s*[=\(]") {
                            $functionStart = $j
                            break
                        }
                        if ($lines[$j] -match "^\s*\{") {
                            $functionStart = $j
                            break
                        }
                    }
                    
                    # Insert apiBaseUrl definition
                    $indent = $line -match "^\s*"
                    if ($matches) {
                        $indentLevel = $matches[0]
                    } else {
                        $indentLevel = ""
                    }
                    
                    # Check if we should insert before current line or at function start
                    $insertAt = $i
                    if ($i -gt 0 -and $lines[$i-1] -match "^\s*try\s*\{") {
                        $insertAt = $i
                    }
                    
                    # Replace the incorrect pattern with template literal
                    $line = $line -replace "'`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}", "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
                    
                    # If it's a fetch call, add apiBaseUrl definition
                    if ($line -match "fetch\(") {
                        $newLine = "$indentLevel      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
                        $newLines += $newLine
                        $hasApiBaseUrl = $true
                    }
                } else {
                    # apiBaseUrl is already defined, just fix the template literal
                    $line = $line -replace "'`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}", "`${apiBaseUrl}"
                }
            }
            
            $newLines += $line
        }
        
        $content = $newLines -join "`n"
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline -ErrorAction Stop
            $count++
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        $errors += "$($file.FullName): $($_.Exception.Message)"
    }
}

Write-Host "`nTotal files updated: $count" -ForegroundColor Cyan
if ($errors.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}

