# Build joblens + meituan-agent + unipass into demos/
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Scripts = $PSScriptRoot
$Desktop = Split-Path -Parent $Root

function Copy-Tree($Source, $Dest) {
  if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  Copy-Item -Path (Join-Path $Source "*") -Destination $Dest -Recurse -Force
}

& (Join-Path $Scripts "download-meituan-assets.ps1")

$JoblensWeb = Join-Path $Desktop "joblens\website"
Write-Host "[1/3] joblens"
Copy-Tree $JoblensWeb (Join-Path $Root "demos\joblens")

$Meituan = Get-ChildItem $Desktop -Directory | Where-Object { $_.Name -like "*agent*" } | Select-Object -First 1 -ExpandProperty FullName
if (-not $Meituan) { throw "meituan source not found" }
Write-Host "[2/3] meituan-agent"
Push-Location $Meituan
$env:VITE_BASE_PATH = "/demos/meituan-agent/"
$env:VITE_PLANNER_MODE = "mock"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location
Copy-Tree (Join-Path $Meituan "dist") (Join-Path $Root "demos\meituan-agent")

Write-Host "[3/3] unipass"
& (Join-Path $Scripts "build-unipass-export.ps1")
Write-Host "done"
