$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot 'backend'
$webDir = Join-Path $projectRoot 'web'
$webDist = Join-Path $webDir 'dist'
$pythonExe = Join-Path $backendDir '.venv\Scripts\python.exe'
$dataDir = Join-Path $backendDir 'data'

if (-not (Test-Path -LiteralPath $pythonExe)) { throw "Local runtime was not found: $pythonExe" }
if (-not (Test-Path -LiteralPath (Join-Path $webDist 'index.html'))) { throw 'Desktop web build was not found.' }
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

function Test-Url([string]$Url) {
  try { Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 | Out-Null; return $true } catch { return $false }
}

$backendOnline = Test-Url 'http://127.0.0.1:8000/api/health'
if (-not $backendOnline) {
  $stdout = Join-Path $dataDir 'server.stdout.log'
  $stderr = Join-Path $dataDir 'server.stderr.log'
  $command = 'start "" /b /d "{0}" "{1}" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 1>"{2}" 2>"{3}"' -f $backendDir, $pythonExe, $stdout, $stderr
  & cmd.exe /d /c $command
}

$webOnline = Test-Url 'http://127.0.0.1:4173'
if (-not $webOnline) {
  $stdout = Join-Path $dataDir 'desktop.stdout.log'
  $stderr = Join-Path $dataDir 'desktop.stderr.log'
  $command = 'start "" /b /d "{0}" "{1}" -m http.server 4173 --bind 127.0.0.1 --directory "{2}" 1>"{3}" 2>"{4}"' -f $webDir, $pythonExe, $webDist, $stdout, $stderr
  & cmd.exe /d /c $command
}

for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
  if ((Test-Url 'http://127.0.0.1:8000/api/health') -and (Test-Url 'http://127.0.0.1:4173')) { break }
  Start-Sleep -Milliseconds 400
}

if (-not (Test-Url 'http://127.0.0.1:8000/api/health')) { throw "Local data service failed to start. See $dataDir\server.stderr.log" }
if (-not (Test-Url 'http://127.0.0.1:4173')) { throw "Desktop page failed to start. See $dataDir\desktop.stderr.log" }

$browserData = Join-Path $dataDir 'browser-profile'
$edgeCandidates = @(
  (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
  (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
)
$edgeExe = $edgeCandidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if ($edgeExe) {
  New-Item -ItemType Directory -Force -Path $browserData | Out-Null
  Start-Process -FilePath $edgeExe -ArgumentList @('--app=http://127.0.0.1:4173', "--user-data-dir=`"$browserData`"")
} else {
  Start-Process 'http://127.0.0.1:4173'
}
Write-Output 'Industry Atlas desktop is ready at http://127.0.0.1:4173'
