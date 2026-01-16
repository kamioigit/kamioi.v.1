# Fast batch fix for missing icon imports
$iconMap = @{
    'CheckCircle' = 'CheckCircle'
    'Mail' = 'Mail'
    'Shield' = 'Shield'
    'Smartphone' = 'Smartphone'
    'Lock' = 'Lock'
    'Eye' = 'Eye'
    'EyeOff' = 'EyeOff'
    'Info' = 'Info'
    'X' = 'X'
    'MessageSquare' = 'MessageSquare'
    'Users' = 'Users'
    'Bell' = 'Bell'
    'BookOpen' = 'BookOpen'
    'Star' = 'Star'
    'FileText' = 'FileText'
    'HelpCircle' = 'HelpCircle'
    'Phone' = 'Phone'
    'Search' = 'Search'
    'ChevronRight' = 'ChevronRight'
    'Download' = 'Download'
    'Video' = 'Video'
    'RefreshCw' = 'RefreshCw'
    'Zap' = 'Zap'
    'Target' = 'Target'
    'TrendingUp' = 'TrendingUp'
    'Lightbulb' = 'Lightbulb'
    'Award' = 'Award'
    'UserPlus' = 'UserPlus'
    'PieChart' = 'PieChart'
    'Settings' = 'Settings'
    'Filter' = 'Filter'
    'Calendar' = 'Calendar'
    'TrendingDown' = 'TrendingDown'
    'MoreVertical' = 'MoreVertical'
    'ChevronLeft' = 'ChevronLeft'
    'User' = 'User'
    'Cloud' = 'Cloud'
    'MapPin' = 'MapPin'
    'CreditCard' = 'CreditCard'
    'Trash2' = 'Trash2'
    'Plus' = 'Plus'
    'Minus' = 'Minus'
    'SettingsIcon' = 'Settings'
}

$files = Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    $needsImport = $false
    $missingIcons = @()
    
    # Check which icons are used but not imported
    foreach ($icon in $iconMap.Keys) {
        $iconName = $iconMap[$icon]
        # Check if icon is used in JSX
        if ($content -match "<$iconName\s" -or $content -match "\b$iconName\s*=" -or $content -match "\b$iconName\s*>" -or $content -match "\b$iconName\s*\)") {
            # Check if it's imported
            if ($content -notmatch "from\s+['""]lucide-react['""]") {
                # No lucide-react import at all
                if ($content -match "import.*from\s+['""]lucide-react['""]") {
                    # Has import, check if icon is in it
                    if ($content -notmatch "$iconName[,\s]") {
                        $missingIcons += $iconName
                        $needsImport = $true
                    }
                } else {
                    # Need to add import line
                    $missingIcons += $iconName
                    $needsImport = $true
                }
            }
        }
    }
    
    if ($needsImport -and $missingIcons.Count -gt 0) {
        # Remove duplicates
        $missingIcons = $missingIcons | Select-Object -Unique
        
        # Find existing lucide-react import
        if ($content -match "import\s+\{([^}]+)\}\s+from\s+['""]lucide-react['""]") {
            $existing = $matches[1]
            $existingIcons = $existing -split ',' | ForEach-Object { $_.Trim() }
            $allIcons = ($existingIcons + $missingIcons) | Select-Object -Unique | Sort-Object
            $newImport = "import { $($allIcons -join ', ') } from 'lucide-react'"
            $content = $content -replace "import\s+\{[^}]+\}\s+from\s+['""]lucide-react['""]", $newImport
        } else {
            # Add new import after React import
            if ($content -match "(import\s+.*from\s+['""]react['""])") {
                $content = $content -replace "($matches[1])", "`$1`nimport { $($missingIcons -join ', ') } from 'lucide-react'"
            } else {
                # Add at top
                $content = "import { $($missingIcons -join ', ') } from 'lucide-react'`n" + $content
            }
        }
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Fixed icons in: $($file.Name)"
        }
    }
}

Write-Host "Done fixing icons!"

