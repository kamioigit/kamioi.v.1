# Fix broken template literals - patterns like fetch(\${ or !== ${

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
        
        # Fix pattern: fetch(\${apiBaseUrl} -> fetch(`${apiBaseUrl}
        $content = $content -replace "fetch\(\\\$\{apiBaseUrl", "fetch(\`${apiBaseUrl"
        
        # Fix pattern: !== ${import.meta.env... -> !== `${import.meta.env...
        $content = $content -replace "!== \$\{import\.meta\.env", "!== \`${import.meta.env"
        
        # Fix pattern: !== '${import.meta.env... -> !== `${import.meta.env...
        $content = $content -replace "!== '\$\{import\.meta\.env", "!== \`${import.meta.env"
        
        # Fix pattern: !== ${import.meta.env... (without quotes) -> !== `${import.meta.env...
        $content = $content -replace "!== \$\{import\.meta\.env", "!== \`${import.meta.env"
        
        # Fix pattern: fetch(\${import.meta.env... -> fetch(`${import.meta.env...
        $content = $content -replace "fetch\(\\\$\{import\.meta\.env", "fetch(\`${import.meta.env"
        
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

