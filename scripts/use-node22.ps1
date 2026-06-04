# Prepends portable Node 22 and global pnpm to PATH for the current PowerShell session.
$nodeDir = Join-Path $env:LOCALAPPDATA 'nodejs22'
$pnpmDir = Join-Path $env:APPDATA 'npm'

if (-not (Test-Path (Join-Path $nodeDir 'node.exe'))) {
  Write-Error "Node 22 not found at $nodeDir. Re-run setup or install Node 22."
  exit 1
}

$env:Path = "$nodeDir;$pnpmDir;" + ($env:Path -split ';' | Where-Object { $_ -and $_ -ne $nodeDir -and $_ -ne $pnpmDir } | Select-Object -Unique) -join ';'

Write-Host "node: $(node -v)"
Write-Host "pnpm: $(pnpm -v)"
