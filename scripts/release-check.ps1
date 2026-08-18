param([switch]$Production)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $projectRoot 'miniprogram')
try {
  & node check.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Mini program validation failed' }
  & node runtime-check.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Mini program runtime validation failed' }
} finally { Pop-Location }

Push-Location (Join-Path $projectRoot 'backend')
try {
  & '.\.venv\Scripts\python.exe' -m pytest -q -p no:cacheprovider
  if ($LASTEXITCODE -ne 0) { throw 'Backend tests failed' }
} finally { Pop-Location }

$sourceFiles = @()
$sourceFiles += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'miniprogram\pages') -Recurse -File | Where-Object { $_.Extension -in '.js','.json','.wxml','.wxss' }
$sourceFiles += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'miniprogram\utils') -Recurse -File | Where-Object { $_.Extension -eq '.js' }
$sourceFiles += Get-Item -LiteralPath (Join-Path $projectRoot 'miniprogram\app.js')
$sourceFiles += Get-ChildItem -LiteralPath (Join-Path $projectRoot 'backend\app') -Recurse -File | Where-Object { $_.Extension -eq '.py' }
if ($sourceFiles | Select-String -Pattern 'sk-[A-Za-z0-9]{20,}') { throw 'Possible model API key found in source files' }

if ($Production) {
  $projectConfig = Get-Content -LiteralPath (Join-Path $projectRoot 'miniprogram\project.config.json') -Encoding utf8 -Raw | ConvertFrom-Json
  if (-not $projectConfig.appid -or $projectConfig.appid -eq 'touristappid') { throw 'Production release requires a real mini program AppID' }
  $environmentPath = Join-Path $projectRoot 'deploy\.env'
  if (-not (Test-Path -LiteralPath $environmentPath)) { throw 'Missing deploy\.env production configuration' }
  $values = @{}
  Get-Content -LiteralPath $environmentPath -Encoding utf8 | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $values[$matches[1].Trim()] = $matches[2].Trim() }
  }
  foreach ($name in 'DOMAIN','APP_SECRET','DEEPSEEK_API_KEY','WECHAT_APP_ID','WECHAT_APP_SECRET','ALLOWED_HOSTS') {
    if (-not $values[$name]) { throw "Missing production value: $name" }
  }
  if ($values.APP_SECRET.Length -lt 32) { throw 'APP_SECRET must contain at least 32 characters' }
  if ($values.ALLOW_DEV_LOGIN -ne 'false') { throw 'ALLOW_DEV_LOGIN must be false in production' }
  if ($values.DOMAIN -match 'example\.com') { throw 'DOMAIN still contains the example value' }
}

$mode = if ($Production) { 'production' } else { 'development' }
Write-Output ('RELEASE_CHECK_OK mode=' + $mode)
