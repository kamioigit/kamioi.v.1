# PowerShell script to replace all hardcoded port 5111 with environment variable pattern
# This script updates all .jsx and .js files in the frontend/src directory

$files = Get-ChildItem -Path "C:\Users\beltr\Kamioi\frontend\src" -Recurse -Include *.jsx,*.js

$replacements = @{
    "http://127.0.0.1:5111" = "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
    "http://localhost:5111" = "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
    "'http://localhost:5111'" = "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
    '"http://localhost:5111"' = "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
    "|| 'http://localhost:5111'" = "|| 'http://localhost:4000'"
}

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Replace hardcoded URLs with environment variable pattern
    $content = $content -replace 'http://127\.0\.0\.1:5111', "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
    $content = $content -replace "http://localhost:5111", "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
    $content = $content -replace "'http://localhost:5111'", "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
    $content = $content -replace '"http://localhost:5111"', "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
    $content = $content -replace "\|\| 'http://localhost:5111'", "|| 'http://localhost:4000'"
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nTotal files updated: $count" -ForegroundColor Cyan

