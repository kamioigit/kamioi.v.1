# Setup Monthly LLM Amortization Task Scheduler (Windows)
# This script creates a Windows Task Scheduler job to run on the 1st of each month

$ScriptPath = Join-Path $PSScriptRoot "..\scheduled_jobs\monthly_llm_amortization.py"
$PythonPath = (Get-Command python).Path
$TaskName = "Monthly LLM Amortization"

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed existing task '$TaskName'" -ForegroundColor Yellow
}

# Create the action
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "`"$ScriptPath`"" -WorkingDirectory (Split-Path $ScriptPath)

# Create the trigger: Monthly on the 1st at 00:00
# Note: PowerShell's New-ScheduledTaskTrigger doesn't have a -Monthly parameter
# We need to create a daily trigger and modify it to run monthly
$Trigger = New-ScheduledTaskTrigger -Daily -At "00:00"
$Trigger.DaysOfWeek = $null
$Trigger.DaysOfMonth = @(1)
$Trigger.WeeksInterval = 0
$Trigger.MonthsOfYear = @(1,2,3,4,5,6,7,8,9,10,11,12)
$Trigger.RandomDelay = $null
$Trigger.Repetition = $null

# Create the principal (run whether user is logged on or not)
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Limited

# Create the settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Runs monthly LLM Data Assets amortization journal entries on the 1st of each month"

Write-Host ""
Write-Host "Monthly LLM amortization task has been created!" -ForegroundColor Green
Write-Host "  Task Name: $TaskName" -ForegroundColor Cyan
Write-Host "  Schedule: 1st of each month at midnight" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view the task, run: Get-ScheduledTask -TaskName 'Monthly LLM Amortization'" -ForegroundColor Yellow
Write-Host "To remove the task, run: Unregister-ScheduledTask -TaskName 'Monthly LLM Amortization'" -ForegroundColor Yellow
