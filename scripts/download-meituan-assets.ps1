# Download Meituan demo images from Vercel into public/assets
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Desktop = Split-Path -Parent $Root
$MeituanSrc = Get-ChildItem $Desktop -Directory | Where-Object { $_.Name -like "*agent*" } | Select-Object -First 1 -ExpandProperty FullName
if (-not $MeituanSrc) { throw "meituan source not found" }

$pub = Join-Path $MeituanSrc "public\assets"
$nested = Join-Path $pub "assets"
if (Test-Path $nested) { Remove-Item $nested -Recurse -Force }

$V = "https://meituan-agent.vercel.app"
foreach ($sub in @("nodes", "map", "transit")) {
  New-Item -ItemType Directory (Join-Path $pub $sub) -Force | Out-Null
}

$nodes = @(
  [char]0x8d77 + [char]0x70b9, [char]0x7ec8 + [char]0x70b9, [char]0x5730 + [char]0x94c1, [char]0x6b65 + [char]0x884c,
  [char]0x7f51 + [char]0x7ea6 + [char]0x8f66, [char]0x81ea + [char]0x9a7e, [char]0x57ce + [char]0x5e02 + [char]0x9a91 + [char]0x884c,
  [char]0x8f7b + [char]0x98df + [char]0x5e97, [char]0x4eb2 + [char]0x5b50 + [char]0x9910 + [char]0x5385, [char]0x70e4 + [char]0x8089 + [char]0x5e97,
  [char]0x706b + [char]0x9505 + [char]0x5e97, [char]0x6c64 + [char]0x9505, [char]0x5ddd + [char]0x83dc + [char]0x9986,
  [char]0x65e5 + [char]0x6599 + [char]0x5e97, [char]0x8336 + [char]0x9910 + [char]0x5385, [char]0x751c + [char]0x54c1 + [char]0x5e97,
  [char]0x7f13 + [char]0x51b2 + [char]0x5496 + [char]0x5561, [char]0x4eb2 + [char]0x5b50 + [char]0x4e50 + [char]0x56ed,
  [char]0x5ba4 + [char]0x5185 + [char]0x6e38 + [char]0x4e50 + [char]0x573a, [char]0x52a8 + [char]0x7269 + [char]0x56ed,
  [char]0x7535 + [char]0x73a9 + [char]0x57ce, [char]0x684c + [char]0x6e38 + [char]0x9986, "KTV", "Livehouse",
  [char]0x5c55 + [char]0x89c8 + [char]0x9986, [char]0x535a + [char]0x7269 + [char]0x9986, [char]0x753b + [char]0x5eca,
  [char]0x4e66 + [char]0x5e97, [char]0x624b + [char]0x5de5 + [char]0x574a, [char]0x70d8 + [char]0x7119 + [char]0x6559 + [char]0x5ba4,
  [char]0x8fd0 + [char]0x52a8 + [char]0x9986, [char]0x516c + [char]0x56ed + [char]0x6563 + [char]0x6b65,
  [char]0x690d + [char]0x7269 + [char]0x56ed, [char]0x6b65 + [char]0x884c + [char]0x8857, [char]0x6e56 + [char]0x8fb9 + [char]0x6f2b + [char]0x6b65,
  [char]0x6ee8 + [char]0x6c5f + [char]0x6b65 + [char]0x9053, [char]0x90ca + [char]0x5916 + [char]0x91ce + [char]0x9910,
  [char]0x591c + [char]0x5e02, [char]0x82b1 + [char]0x5e02, [char]0x8d85 + [char]0x5e02, [char]0x5546 + [char]0x573a
)
foreach ($label in $nodes) {
  $file = "$label.png"
  $enc = [uri]::EscapeDataString($file)
  $dest = Join-Path $pub "nodes\$file"
  if (-not (Test-Path $dest)) {
    try { Invoke-WebRequest "$V/assets/nodes/$enc" -OutFile $dest -UseBasicParsing } catch {}
  }
}
$bgName = [string]([char]0x65b0) + [char]0x80cc + [char]0x666f + ".jpeg"
$bgEnc = [uri]::EscapeDataString($bgName)
$bgDest = Join-Path $pub "map\$bgName"
if (-not (Test-Path $bgDest)) {
  Invoke-WebRequest "$V/assets/map/$bgEnc" -OutFile $bgDest -UseBasicParsing
}
foreach ($t in @(
  [char]0x5c0f + [char]0x8f66, [char]0x8d70 + [char]0x8def, [char]0x5730 + [char]0x94c1 + [char]0x51fa + [char]0x884c
)) {
  $enc = [uri]::EscapeDataString("$t.png")
  $dest = Join-Path $pub "transit\$t.png"
  if (-not (Test-Path $dest)) {
    try { Invoke-WebRequest "$V/assets/transit/$enc" -OutFile $dest -UseBasicParsing } catch {}
  }
}
Write-Host "meituan assets ok"
