# Start policy-regai for colleagues on the same Wi-Fi (LAN).
# Usage: .\scripts\start-lan-dev.ps1 [-LanIp 172.16.101.52]

param(
  [string]$LanIp = '172.16.101.52'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent

. (Join-Path $repoRoot 'scripts\use-node22.ps1')

Write-Host "`n=== Lecheng Policy LAN dev ===" -ForegroundColor Cyan
Write-Host "LAN IP: $LanIp"

# Windows Firewall — allow inbound 80 (Docker) and 3000 (policy-regai dev)
$rules = @(
  @{ Name = 'Lecheng Policy - HTTP 80'; Port = 80 },
  @{ Name = 'Lecheng Policy - Dev 3000'; Port = 3000 }
)
foreach ($rule in $rules) {
  $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
  if (-not $existing) {
    New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $rule.Port | Out-Null
    Write-Host "Firewall: opened TCP $($rule.Port)" -ForegroundColor Green
  }
  else {
    Write-Host "Firewall: TCP $($rule.Port) already allowed" -ForegroundColor DarkGray
  }
}
Write-Host "If colleagues cannot connect, run PowerShell as Administrator and allow TCP 80 + 3000." -ForegroundColor Yellow

# Restart Docker web/nginx/api so CONSOLE_WEB_URL etc. take effect
Write-Host "`nRestarting Docker services (nginx, web, api)..." -ForegroundColor Yellow
Push-Location (Join-Path $repoRoot 'docker')
docker compose restart nginx web api 2>&1 | Write-Host
Pop-Location

# Stop stale dev servers on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

Write-Host "`nShare these URLs with colleagues on the same Wi-Fi:" -ForegroundColor Cyan
Write-Host "  Platform home:  http://${LanIp}:3000/policy-regai/compare"
Write-Host "  Regulations:    http://${LanIp}:3000/policy-regai/regulations"
Write-Host "  Knowledge graph:http://${LanIp}:3000/policy-regai/knowledge-graph"
Write-Host "  AI assistant:   http://${LanIp}:3000/policy-regai/assistant"
Write-Host "  Dify console:   http://${LanIp}/signin"
Write-Host "`nStarting pnpm dev:lan (bind 0.0.0.0:3000)..." -ForegroundColor Yellow
Set-Location $repoRoot
pnpm dev:lan
