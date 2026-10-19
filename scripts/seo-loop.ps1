<#
.SYNOPSIS
    Continuous SEO, GEO & Architecture Drift Analysis Loop for Supletivo.net.br
.DESCRIPTION
    Compares live page state against stored baseline snapshot (17 rules),
    and validates AI agent readiness (robots.txt, llms.txt, 404 behavior).
#>
[CmdletBinding()]
param (
    [string]$TargetUrl = "https://supletivo.net.br",
    [int]$BaselineId = 3
)

$ErrorActionPreference = 'Stop'
$Runner = "C:\Users\maestri33\.gemini\config\skills\antigravity-seo\run.ps1"

if (-not (Test-Path $Runner)) {
    Write-Error "antigravity-seo runner não encontrado em $Runner"
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🔍 [SEO Drift Loop] Iniciando verificação para $TargetUrl" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Executa comparação de drift contra baseline
Write-Host "`n[1/2] Comparando com Baseline #$BaselineId (17 regras de drift)..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File $Runner "drift_compare.py" $TargetUrl --skip-cwv --baseline-id $BaselineId
$driftExit = $LASTEXITCODE

# 2. Executa checagem de prontidão para agentes (Agentic Readiness)
Write-Host "`n[2/2] Auditando prontidão de agentes de IA (llms.txt, robots.txt, 404s)..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File $Runner "agentic_check.py" $TargetUrl
$agenticExit = $LASTEXITCODE

if ($driftExit -eq 0 -and $agenticExit -eq 0) {
    Write-Host "`n✅ [SEO Drift Loop] Loop de auditoria concluído com sucesso!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ [SEO Drift Loop] Avisos ou não conformidades detectadas." -ForegroundColor Yellow
    exit 1
}
