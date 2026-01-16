# Bulk replace script for remaining port 5111 references
# This script will replace all hardcoded port 5111 with environment variable pattern

$files = Get-ChildItem -Path "C:\Users\beltr\Kamioi\frontend\src" -Recurse -Include *.jsx,*.js | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.backup.*" }

$count = 0
$errors = @()

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $original = $content
        
        # Replace patterns
        $content = $content -replace 'http://127\.0\.0\.1:5111', "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
        $content = $content -replace "http://localhost:5111", "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}"
        $content = $content -replace "'http://localhost:5111'", "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
        $content = $content -replace '"http://localhost:5111"', "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'"
        $content = $content -replace "\|\| 'http://localhost:5111'", "|| 'http://localhost:4000'"
        $content = $content -replace "\|\| `"http://localhost:5111`"", "|| `"http://localhost:4000`""
        
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

