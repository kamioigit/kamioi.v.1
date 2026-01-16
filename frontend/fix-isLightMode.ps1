# Fast batch fix for isLightMode
$files = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match 'isLightMode' -and 
    $content -match 'useTheme' -and 
    -not ($content -match 'const\s*\{\s*[^}]*isLightMode')
}

Write-Host "Found $($files.Count) files to fix"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Pattern 1: Add to existing useTheme destructuring
    if ($content -match "const\s*\{\s*([^}]+)\s*\}\s*=\s*useTheme\(\)") {
        $existing = $matches[1]
        if ($existing -notmatch 'isLightMode') {
            $content = $content -replace "const\s*\{\s*([^}]+)\s*\}\s*=\s*useTheme\(\)", "const { `$1, isLightMode } = useTheme()"
        }
    }
    # Pattern 2: Add new line after useTheme import but before first use
    elseif ($content -match "from\s+['""].*ThemeContext['""]") {
        # Find the component function and add after opening brace
        $lines = $content -split "`n"
        $found = $false
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^\s*const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{") {
                # Found component, add after next line
                if ($i + 1 -lt $lines.Length -and $lines[$i+1] -notmatch "const.*useTheme") {
                    $indent = if ($lines[$i+1] -match "^\s+") { $matches[0] } else { "  " }
                    $lines = $lines[0..($i+1)] + "$indent const { isLightMode } = useTheme()" + $lines[($i+2)..($lines.Length-1)]
                    $content = $lines -join "`n"
                    $found = $true
                    break
                }
            }
        }
    }
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "Done!"

