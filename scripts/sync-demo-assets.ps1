# Sync demo images + rebuild all demos (entry for 构建作品Demo.bat)
$ErrorActionPreference = "Stop"
& (Join-Path $PSScriptRoot "build-demos.ps1")
Write-Host "sync complete"
