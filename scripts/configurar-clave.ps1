# Guarda la clave de PostgreSQL en un archivo local FUERA del proyecto.
# Se usa para que el backend arranque sin pedirla cada vez.
$ErrorActionPreference = 'Stop'

$destino = Join-Path $env:USERPROFILE '.config\opencode\postgres-password.txt'
$carpeta = Split-Path $destino -Parent
New-Item -ItemType Directory -Force -Path $carpeta | Out-Null

Write-Host ""
Write-Host "Configuracion local de la clave de PostgreSQL" -ForegroundColor Cyan
Write-Host "El archivo se guarda en: $destino" -ForegroundColor DarkGray
Write-Host ""

$segura = Read-Host "Escribe la clave del usuario postgres" -AsSecureString

$puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
try {
    $clave = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero)
}

if ([string]::IsNullOrWhiteSpace($clave)) {
    Write-Host "No se guardo nada: la clave esta vacia." -ForegroundColor Yellow
    exit 1
}

$utf8SinBom = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText($destino, $clave, $utf8SinBom)

# Tambien se intenta guardar como variable de usuario (opcional).
[Environment]::SetEnvironmentVariable('PGPASSWORD', $clave, 'User')

if (Test-Path $destino) {
    Write-Host ""
    Write-Host "Clave guardada correctamente." -ForegroundColor Green
    Write-Host "Archivo: $destino" -ForegroundColor DarkGray
    Write-Host "Ahora ejecuta: .\scripts\run-backend.ps1" -ForegroundColor Cyan
} else {
    Write-Host "No se pudo crear el archivo de la clave." -ForegroundColor Red
    exit 1
}
