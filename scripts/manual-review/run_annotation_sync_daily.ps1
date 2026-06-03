#Requires -Version 5.1
<#
.SYNOPSIS
  Daily LangSmith annotation queue sync (manual-review runs).

.DESCRIPTION
  Loads LANGSMITH_API_KEY from langsmith.env.local (or existing env),
  runs sync_langsmith_annotation_queue.py, appends stdout/stderr to logs/.

  First-time setup:
    1. Copy langsmith.env.example -> langsmith.env.local and set LANGSMITH_API_KEY
    2. .\register_daily_annotation_sync_task.ps1
#>
param(
    [string]$EnvFile = (Join-Path $PSScriptRoot "langsmith.env.local"),
    [int]$Hours = 0,
    [int]$Limit = 0,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$LogDir = Join-Path $ScriptDir "logs"
$SyncScript = Join-Path $ScriptDir "sync_langsmith_annotation_queue.py"

function Import-DotEnvFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }
    Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $eq = $line.IndexOf("=")
        if ($eq -lt 1) { return }
        $name = $line.Substring(0, $eq).Trim()
        $value = $line.Substring($eq + 1).Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

function Get-EnvOrDefault {
    param([string]$Name, [string]$Default)
    $v = [Environment]::GetEnvironmentVariable($Name, "Process")
    if ([string]::IsNullOrWhiteSpace($v)) { return $Default }
    return $v
}

Import-DotEnvFile -Path $EnvFile

if (-not $env:LANGSMITH_API_KEY) {
    Write-Error @"
LANGSMITH_API_KEY is not set.
Copy langsmith.env.example to langsmith.env.local and set your API key, or export LANGSMITH_API_KEY in the shell.
"@
}

$queueId = Get-EnvOrDefault "LANGSMITH_QUEUE_ID" ""
if (-not $queueId) {
    Write-Error "LANGSMITH_QUEUE_ID is not set (use langsmith.env.local)."
}

$project = Get-EnvOrDefault "LANGSMITH_PROJECT" "Lecheng_policy_ai_agent"
$runName = Get-EnvOrDefault "SYNC_RUN_NAME" "llm"

if ($Hours -le 0) {
    $hoursStr = Get-EnvOrDefault "SYNC_HOURS" "30"
    $Hours = [int]$hoursStr
}
if ($Limit -le 0) {
    $limitStr = Get-EnvOrDefault "SYNC_LIMIT" "100"
    $Limit = [int]$limitStr
}

$pythonExe = $null
$pythonPrefix = @()
foreach ($candidate in @("python", "py")) {
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) {
        if ($candidate -eq "py") {
            $pythonExe = "py"
            $pythonPrefix = @("-3")
        } else {
            $pythonExe = "python"
        }
        break
    }
}
if (-not $pythonExe) {
    Write-Error "Python not found on PATH. Install Python 3 and langsmith: pip install langsmith"
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = Join-Path $LogDir "annotation_sync_$stamp.log"

$argsList = @(
    $SyncScript,
    "--queue-id", $queueId,
    "--project", $project,
    "--run-name", $runName,
    "--hours", "$Hours",
    "--limit", "$Limit"
)
if ($DryRun) {
    $argsList += "--dry-run"
}

$header = @"
=== LangSmith annotation sync $(Get-Date -Format o) ===
project=$project queue_id=$queueId hours=$Hours limit=$Limit dry_run=$($DryRun.IsPresent)
"@
$header | Out-File -FilePath $logFile -Encoding utf8

Push-Location $ScriptDir
try {
    & $pythonExe @pythonPrefix @argsList 2>&1 |
        Tee-Object -FilePath $logFile -Append
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($null -eq $exitCode) { $exitCode = 0 }
"=== exit_code=$exitCode ===" | Out-File -FilePath $logFile -Append -Encoding utf8

# Keep last 60 log files
Get-ChildItem -Path $LogDir -Filter "annotation_sync_*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 60 |
    Remove-Item -Force -ErrorAction SilentlyContinue

exit $exitCode
