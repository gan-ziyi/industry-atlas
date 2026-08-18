param(
  [string]$Destination = ""
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot 'miniprogram'
if (-not $Destination) { $Destination = Join-Path $projectRoot 'IndustryAtlas-WeChat-MiniProgram-Release.zip' }

& node (Join-Path $sourceRoot 'check.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Mini program static validation failed' }
& node (Join-Path $sourceRoot 'runtime-check.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Mini program runtime validation failed' }

$allowedRootFiles = @('app.js', 'app.json', 'app.wxss', 'project.config.json', 'sitemap.json', 'README.md')
$files = foreach ($name in $allowedRootFiles) { Get-Item -LiteralPath (Join-Path $sourceRoot $name) }
$files += Get-ChildItem -LiteralPath (Join-Path $sourceRoot 'pages') -Recurse -File | Where-Object { $_.Extension -in '.js', '.json', '.wxml', '.wxss' }
$files += Get-ChildItem -LiteralPath (Join-Path $sourceRoot 'utils') -Recurse -File | Where-Object { $_.Extension -eq '.js' }

$secretValues = @()
$backendEnv = Join-Path $projectRoot 'backend\.env'
if (Test-Path -LiteralPath $backendEnv) {
  Get-Content -LiteralPath $backendEnv -Encoding utf8 | ForEach-Object {
    if ($_ -match '^\s*(DEEPSEEK_API_KEY|WECHAT_APP_SECRET)=(.+)$' -and $matches[2].Trim()) { $secretValues += $matches[2].Trim() }
  }
}
$containsSecret = [bool]($files | Select-String -Pattern 'sk-[A-Za-z0-9]{20,}')
foreach ($secret in $secretValues) {
  if ($files | Select-String -SimpleMatch $secret) { $containsSecret = $true }
}
if ($containsSecret) {
  throw 'Release source contains a possible server-side secret'
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$resolvedDestination = [System.IO.Path]::GetFullPath($Destination)
if (Test-Path -LiteralPath $resolvedDestination) { Remove-Item -LiteralPath $resolvedDestination -Force }
$archive = [System.IO.Compression.ZipFile]::Open($resolvedDestination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $baseUri = [System.Uri]::new(($sourceRoot.TrimEnd('\') + '\'))
    $fileUri = [System.Uri]::new($file.FullName)
    $relative = [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($fileUri).ToString())
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $archive.Dispose()
}

Write-Output ("MINIPROGRAM_RELEASE_OK files={0} path={1}" -f $files.Count, $resolvedDestination)
