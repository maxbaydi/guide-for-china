# Script to allow Docker ports through Windows Firewall
# Run as Administrator in PowerShell

$ports = @(4000, 4001, 4002, 5432, 6379)
$ruleName = "HanGuide Development"

Write-Host "Configuring Windows Firewall for HanGuide development..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $existingRule = Get-NetFirewallRule -DisplayName "$ruleName - Port $port" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "Rule for port $port already exists, updating..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "$ruleName - Port $port"
    }
    
    New-NetFirewallRule -DisplayName "$ruleName - Port $port" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $port `
        -Action Allow `
        -Profile Private,Domain `
        -Enabled True | Out-Null
    
    Write-Host "Port $port allowed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Firewall configuration complete!" -ForegroundColor Green
Write-Host "You can now access the API from your mobile device" -ForegroundColor Cyan
Write-Host "API URL: http://192.168.31.88:4000" -ForegroundColor Yellow
