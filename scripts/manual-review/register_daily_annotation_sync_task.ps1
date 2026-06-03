#Requires -Version 5.1
<#
.SYNOPSIS
  Register a Windows scheduled task to run LangSmith manual-review sync once per day.

.PARAMETER Time
  Local time of day (HH:mm), default 08:00.

.PARAMETER TaskName
  Scheduled task name.

.EXAMPLE
  .\register_daily_annotation_sync_task.ps1
  .\register_daily_annotation_sync_task.ps1 -Time "07:30"
#>
param(
    [string]$Time = "08:00",
    [string]$TaskName = "Lecheng-LangSmith-ManualReview-Sync"
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$Runner = Join-Path $ScriptDir "run_annotation_sync_daily.ps1"
$EnvLocal = Join-Path $ScriptDir "langsmith.env.local"

if (-not (Test-Path -LiteralPath $Runner)) {
    Write-Error "Missing runner script: $Runner"
}

if (-not (Test-Path -LiteralPath $EnvLocal)) {
    Write-Host @"
[WARN] langsmith.env.local not found.
       Copy langsmith.env.example -> langsmith.env.local and set LANGSMITH_API_KEY before the first run.
"@ -ForegroundColor Yellow
}

$timeParts = $Time -split ":"
if ($timeParts.Count -ne 2) {
    Write-Error "Time must be HH:mm, got: $Time"
}
$hour = [int]$timeParts[0]
$minute = [int]$timeParts[1]

$psExe = (Get-Command powershell.exe).Source
$arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Runner`""

$action = New-ScheduledTaskAction -Execute $psExe -Argument $arguments -WorkingDirectory $ScriptDir
$trigger = New-ScheduledTaskTrigger -Daily -At (Get-Date -Hour $hour -Minute $minute -Second 0)
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Daily sync: LangSmith runs with 是否需要人工复核=是 -> Annotation Queue" `
    -Force | Out-Null

Write-Host "[OK] Registered daily task: $TaskName at $Time (local)" -ForegroundColor Green
Write-Host "     Runner: $Runner"
Write-Host "     Logs:   $(Join-Path $ScriptDir 'logs')"
Write-Host ""
Write-Host "Test now:  .\run_annotation_sync_daily.ps1"
Write-Host "View task: taskschd.msc  (Task Scheduler Library -> $TaskName)"
