# Arranca el backend Spring Boot con la clave leida de:
#   1. DB_PASSWORD (solo esta sesion)
#   2. PGPASSWORD de usuario
#   3. C:\Users\<usuario>\.config\opencode\postgres-password.txt
#   4. Pregunta segura si no encuentra nada
$ErrorActionPreference = 'Stop'

$raiz = Split-Path $PSScriptRoot -Parent
$proyecto = Join-Path $raiz 'taller_jwt'
$archivoClave = Join-Path $env:USERPROFILE '.config\opencode\postgres-password.txt'

$clave = $env:DB_PASSWORD
if (-not $clave) { $clave = [Environment]::GetEnvironmentVariable('PGPASSWORD', 'User') }
if (-not $clave -and (Test-Path $archivoClave)) {
    $clave = [IO.File]::ReadAllText($archivoClave).Trim()
}

if (-not $clave -or $clave -eq 'ESCRIBE_AQUI_TU_CLAVE') {
    $usuarioMostrar = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { 'postgres' }
    $segura = Read-Host "Clave del usuario PostgreSQL ($usuarioMostrar)" -AsSecureString
    $puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
    try {
        $clave = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero)
    }
}

if (-not $clave) {
    Write-Host "No hay clave de PostgreSQL. Ejecuta .\scripts\configurar-clave.ps1" -ForegroundColor Yellow
    exit 1
}

$env:DB_PASSWORD = $clave
if (-not $env:DB_USERNAME) { $env:DB_USERNAME = 'postgres' }
if (-not $env:DB_URL) { $env:DB_URL = 'jdbc:postgresql://localhost:5432/mascotas_db' }

$mvn = & (Join-Path $PSScriptRoot 'obtener-maven.ps1')

Write-Host ""
Write-Host "Base de datos: $env:DB_URL" -ForegroundColor DarkGray
Write-Host "Usuario: $env:DB_USERNAME" -ForegroundColor DarkGray
Write-Host "Iniciando Spring Boot en http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host "La base mascotas_db se crea automaticamente si no existe." -ForegroundColor DarkGray
Write-Host ""

Push-Location $proyecto
try {
    & $mvn spring-boot:run
} finally {
    Pop-Location
}
