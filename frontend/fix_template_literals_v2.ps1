# Fix incomplete template literal replacements
# Replaces fetch(${import.meta.env... with proper template literals

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
        
        # Fix pattern: fetch(${import.meta.env... -> fetch(`${apiBaseUrl}...
        # First, add apiBaseUrl definition if not present, then fix the fetch call
        
        # Pattern 1: fetch(${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/...
        $pattern1 = "fetch\(\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}"
        if ($content -match $pattern1) {
            # Check if apiBaseUrl is already defined in the function
            $lines = $content -split "`n"
            $newLines = @()
            
            for ($i = 0; $i -lt $lines.Count; $i++) {
                $line = $lines[$i]
                
                # Check if this line has the broken pattern
                if ($line -match "fetch\(\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}") {
                    # Check if apiBaseUrl is defined in previous lines of this function
                    $prevContext = ($lines[0..($i-1)] -join "`n")
                    $functionStart = 0
                    for ($j = $i - 1; $j -ge 0; $j--) {
                        if ($lines[$j] -match "(async\s+)?(function|const|let|var)\s+\w+\s*[=\(]|^\s*try\s*\{") {
                            $functionStart = $j
                            break
                        }
                    }
                    
                    $functionContext = ($lines[$functionStart..($i-1)] -join "`n")
                    
                    if ($functionContext -notmatch "const apiBaseUrl = import\.meta\.env\.VITE_API_BASE_URL") {
                        # Add apiBaseUrl definition
                        $indent = ""
                        if ($line -match "^\s+") {
                            $indent = $matches[0]
                        }
                        $newLines += "$indent      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
                    }
                    
                    # Fix the fetch call
                    $line = $line -replace "fetch\(\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}", "fetch(\`${apiBaseUrl}"
                }
                
                $newLines += $line
            }
            
            $content = $newLines -join "`n"
        }
        
        # Pattern 2: Other contexts with ${import.meta.env... (not in fetch)
        $content = $content -replace "\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http://localhost:4000'\}", "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
        
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

