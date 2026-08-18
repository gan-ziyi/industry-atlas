$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot 'backend'
$pythonExe = Join-Path $backendDir '.venv\Scripts\python.exe'
$miniProgramDir = Join-Path $projectRoot 'miniprogram'
$devToolsRoot = 'D:\IndustryAtlas-WeChat-DevTools'
$devToolsExe = Get-ChildItem -LiteralPath $devToolsRoot -Recurse -Depth 2 -File -Filter '*.exe' -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -notmatch '^[\x00-\x7F]+$' -and $_.Length -gt 1MB } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not (Test-Path -LiteralPath $pythonExe)) { throw "Backend runtime not found: $pythonExe" }
if (-not $devToolsExe) { throw 'WeChat DevTools installation was not found.' }

$backendOnline = $false
try {
  $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2
  $backendOnline = $health.status -eq 'ok'
} catch {}

if (-not $backendOnline) {
  $stdout = Join-Path $backendDir 'data\server.stdout.log'
  $stderr = Join-Path $backendDir 'data\server.stderr.log'
  $startBackend = 'start "" /b /d "{0}" "{1}" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 1>"{2}" 2>"{3}"' -f $backendDir, $pythonExe, $stdout, $stderr
  & cmd.exe /d /c $startBackend
  for ($attempt = 0; $attempt -lt 15 -and -not $backendOnline; $attempt += 1) {
    Start-Sleep -Milliseconds 500
    try {
      $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2
      $backendOnline = $health.status -eq 'ok'
    } catch {}
  }
}

if (-not $backendOnline) { throw "Backend failed to start. See $backendDir\data\server.stderr.log" }

$openDevTools = 'start "" "{0}" --project "{1}"' -f $devToolsExe, $miniProgramDir
& cmd.exe /d /c $openDevTools
Write-Output 'Industry Atlas local development environment is ready.'
