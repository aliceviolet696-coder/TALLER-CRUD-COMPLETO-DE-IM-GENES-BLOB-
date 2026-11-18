# Instala dependencias (si hace falta) y arranca Vite.
$ErrorActionPreference = 'Stop'

$raiz = Split-Path $PSScriptRoot -Parent
$proyecto = Join-Path $raiz 'mi-proyecto-jwt'

Push-Location $proyecto
try {
    if (-not (Test-Path 'node_modules')) {
        Write-Host "Instalando dependencias de React..." -ForegroundColor Cyan
        npm install
    }

    Write-Host ""
    Write-Host "Frontend en http://localhost:5173" -ForegroundColor Cyan
    Write-Host "Backend esperado en http://localhost:8080" -ForegroundColor DarkGray
    Write-Host ""

    npm run dev
} finally {
    Pop-Location
}
