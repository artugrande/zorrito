# Script de despliegue para Windows PowerShell
# Deploy Proof of Human Contract Script para Zorrito Finance

param(
    [string]$Network = "celo-mainnet"
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Blue }
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }

# Verificar que existe .env
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found. Please copy .env.example to .env and configure it."
    exit 1
}

# Cargar variables de entorno
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Variables requeridas
$requiredVars = @("PRIVATE_KEY")
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var, "Process")) {
        Write-Error "Required environment variable $var is not set"
        exit 1
    }
}

# Configuración de red
$scopeSeed = if ([Environment]::GetEnvironmentVariable("SCOPE_SEED", "Process")) {
    [Environment]::GetEnvironmentVariable("SCOPE_SEED", "Process")
} else {
    "zorrito-finance"
}

switch ($Network) {
    "celo-mainnet" {
        $hubAddress = if ([Environment]::GetEnvironmentVariable("IDENTITY_VERIFICATION_HUB_ADDRESS", "Process")) {
            [Environment]::GetEnvironmentVariable("IDENTITY_VERIFICATION_HUB_ADDRESS", "Process")
        } else {
            "0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF"
        }
        $rpcUrl = "https://forno.celo.org"
        $chainId = "42220"
        $explorerUrl = "https://celoscan.io"
    }
    "celo-sepolia" {
        $hubAddress = if ([Environment]::GetEnvironmentVariable("IDENTITY_VERIFICATION_HUB_ADDRESS", "Process")) {
            [Environment]::GetEnvironmentVariable("IDENTITY_VERIFICATION_HUB_ADDRESS", "Process")
        } else {
            "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74"
        }
        $rpcUrl = "https://forno.celo-sepolia.celo-testnet.org"
        $chainId = "11142220"
        $explorerUrl = "https://celo-sepolia.blockscout.com"
    }
    default {
        Write-Error "Unsupported network: $Network. Use 'celo-mainnet' or 'celo-sepolia'"
        exit 1
    }
}

Write-Success "Network configured: $Network"
Write-Info "Hub Address: $hubAddress"
Write-Info "RPC URL: $rpcUrl"
Write-Info "Scope Seed: $scopeSeed"

# Exportar variables para el script de Solidity
$env:IDENTITY_VERIFICATION_HUB_ADDRESS = $hubAddress
$env:SCOPE_SEED = $scopeSeed

# Compilar contratos
Write-Info "Building Solidity contracts..."
forge build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Contract compilation failed"
    exit 1
}
Write-Success "Contract compilation successful!"

# Desplegar contrato
Write-Info "Deploying ProofOfHuman contract with scope seed: $scopeSeed"
$deployCmd = "forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman --rpc-url $rpcUrl --private-key $env:PRIVATE_KEY --broadcast"

Write-Host "🚀 Executing deployment..." -ForegroundColor Cyan
Invoke-Expression $deployCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "Contract deployment failed"
    exit 1
}

Write-Success "Deployment transaction confirmed!"

# Extraer dirección del contrato
$broadcastDir = "broadcast/DeployProofOfHuman.s.sol/$chainId"
$runLatestFile = Get-ChildItem -Path $broadcastDir -Filter "run-latest.json" -Recurse | Select-Object -First 1

if ($runLatestFile) {
    $jsonContent = Get-Content $runLatestFile.FullName | ConvertFrom-Json
    $contractAddress = ($jsonContent.transactions | Where-Object { $_.contractName -eq "ProofOfHuman" } | Select-Object -First 1).contractAddress
    
    if ($contractAddress) {
        $contractAddress = $contractAddress.ToLower()
        Write-Success "Contract deployed at: $contractAddress"
        Write-Info "View on explorer: $explorerUrl/address/$contractAddress"
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Success "🎉 Deployment Completed Successfully!"
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host ""
        Write-Host "Quick Links:"
        Write-Host "- Contract Address: $contractAddress"
        Write-Host "- View on Explorer: $explorerUrl/address/$contractAddress"
        Write-Host ""
        Write-Warning "IMPORTANT: Frontend Configuration"
        Write-Host "Add this to your frontend .env.local file:"
        Write-Host "NEXT_PUBLIC_SELF_ENDPOINT=$contractAddress" -ForegroundColor Yellow
    } else {
        Write-Error "Could not extract contract address from deployment"
        exit 1
    }
} else {
    Write-Error "Could not find deployment artifacts"
    exit 1
}

