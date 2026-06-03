# Build joblens + meituan-agent into demos/ (ASCII-only for Windows encoding)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Desktop = Split-Path -Parent $Root

function Copy-Tree($Source, $Dest) {
  if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
  New-Item -ItemType Directory -Path $Dest -Force | Out-Null
  Copy-Item -Path (Join-Path $Source "*") -Destination $Dest -Recurse -Force
}

$JoblensWeb = Join-Path $Desktop "joblens\website"
Write-Host "[1/2] joblens"
Copy-Tree $JoblensWeb (Join-Path $Root "demos\joblens")

$Meituan = Join-Path $Desktop "美团agent终"
Write-Host "[2/2] meituan-agent"
Push-Location $Meituan
$env:VITE_BASE_PATH = "/demos/meituan-agent/"
$env:VITE_PLANNER_MODE = "mock"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location
Copy-Tree (Join-Path $Meituan "dist") (Join-Path $Root "demos\meituan-agent")

Write-Host "OK. UniPass: still uses vercel proxy until static export is fixed."
