# Export UniPass marketing static site into demos/unipass
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Unipass = Join-Path (Split-Path -Parent $Root) "unipass全部\unipass-work"
$Dest = Join-Path $Root "demos\unipass"
$ApiDir = Join-Path $Unipass "app\api"
$ApiOff = Join-Path $Unipass "app\_api_export_off"
$Nc = Join-Path $Unipass "next.config.ts"
$NcOrig = Join-Path $PSScriptRoot "next-export.config.ts"

if (-not (Test-Path $Unipass)) {
  Write-Host "Path not found: $Unipass"
  exit 1
}

$ncBackup = Get-Content $Nc -Raw -Encoding UTF8
$apiMoved = $false
try {
  if (Test-Path $ApiDir) {
    if (Test-Path $ApiOff) { Remove-Item $ApiOff -Recurse -Force }
    Rename-Item $ApiDir "_api_export_off"
    $apiMoved = $true
  }
  Remove-Item (Join-Path $Unipass ".next") -Recurse -Force -ErrorAction SilentlyContinue
  Copy-Item $NcOrig $Nc -Force
  Push-Location $Unipass
  $env:NEXT_PUBLIC_APP_ORIGIN = "https://unipass-nu.vercel.app"
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "next build failed" }
  Pop-Location
  if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
  Copy-Item (Join-Path $Unipass "out") $Dest -Recurse -Force
  Write-Host "OK: demos/unipass"
}
finally {
  Set-Content -Path $Nc -Value $ncBackup -Encoding UTF8 -NoNewline
  if ($apiMoved -and (Test-Path $ApiOff)) {
    Rename-Item $ApiOff "api" -Force
  }
}
