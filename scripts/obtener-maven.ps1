# Localiza (o descarga una vez) Apache Maven 3.9.9 y escribe su ruta completa.
# Uso:  $mvn = .\scripts\obtener-maven.ps1
$ErrorActionPreference = 'Stop'

$version = '3.9.9'
$destino = Join-Path $env:LOCALAPPDATA 'opencode-maven'
$mvn = Join-Path $destino "apache-maven-$version\bin\mvn.cmd"

if (Test-Path $mvn) {
    return $mvn
}

# 1) Si ya esta en el PATH, se usa ese.
$enPath = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if ($enPath) {
    return $enPath.Source
}

# 2) Si existe MAVEN_HOME / M2_HOME con la instalacion, se usa.
foreach ($variable in @('MAVEN_HOME', 'M2_HOME')) {
    $casa = [Environment]::GetEnvironmentVariable($variable, 'User')
    if (-not $casa) { $casa = [Environment]::GetEnvironmentVariable($variable, 'Machine') }
    if ($casa) {
        $candidato = Join-Path $casa 'bin\mvn.cmd'
        if (Test-Path $candidato) { return $candidato }
    }
}

# 3) Se descarga Maven una sola vez en el perfil del usuario.
$zip = Join-Path $env:TEMP "apache-maven-$version-bin.zip"
$url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$version/apache-maven-$version-bin.zip"

Write-Host "Maven no esta instalado. Descargando $version (~9 MB)..." -ForegroundColor Cyan
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing

Write-Host "Descomprimiendo en $destino ..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $destino | Out-Null
Expand-Archive -Path $zip -DestinationPath $destino -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

if (-not (Test-Path $mvn)) {
    throw "No se pudo instalar Maven en $mvn"
}

Write-Host "Maven instalado: $mvn" -ForegroundColor Green
return $mvn
