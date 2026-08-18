$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'backend\data'
$backupRoot = Join-Path $projectRoot 'desktop-data-backups'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $backupRoot "industry-atlas-data-$stamp.zip"
$staging = Join-Path $env:TEMP "industry-atlas-backup-$stamp"

if (-not (Test-Path -LiteralPath $source)) { throw 'Local data was not found. Start the desktop app first.' }
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
New-Item -ItemType Directory -Force -Path $staging | Out-Null
try {
  $database = Join-Path $source 'industry_atlas.db'
  if (Test-Path -LiteralPath $database) { Copy-Item -LiteralPath $database -Destination $staging -Force }
  $uploads = Join-Path $source 'uploads'
  if (Test-Path -LiteralPath $uploads) { Copy-Item -LiteralPath $uploads -Destination $staging -Recurse -Force }
  $browserProfile = Join-Path $source 'browser-profile'
  if (Test-Path -LiteralPath $browserProfile) { Copy-Item -LiteralPath $browserProfile -Destination $staging -Recurse -Force }
  Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $destination -CompressionLevel Optimal
} finally {
  if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging -Recurse -Force }
}
Write-Output "Backup created: $destination"
Start-Process explorer.exe -ArgumentList "/select,`"$destination`""
