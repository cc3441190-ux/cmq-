# 将整站同步到阿里云 OSS（需已安装 ossutil 并配置 ossutil config）
# 用法: .\scripts\sync-oss.ps1 -Bucket "cmq-portfolio-prod"

param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,
  [string]$Endpoint = "oss-cn-hangzhou.aliyuncs.com"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command ossutil -ErrorAction SilentlyContinue)) {
  Write-Host "请先安装 ossutil 并执行 ossutil config 配置 AccessKey。" -ForegroundColor Red
  Write-Host "文档: https://help.aliyun.com/zh/oss/developer-reference/ossutil/"
  exit 1
}

$target = "oss://$Bucket/"
Write-Host "上传 $Root -> $target" -ForegroundColor Cyan
ossutil cp $Root $target -r -f `
  --exclude ".git/*" `
  --exclude ".cursor/*" `
  --exclude "*.bat" `
  --exclude "scripts/*.py" `
  --exclude "assets/hardware/aura/source/*" `
  --exclude "assets/hardware/portfolio-source/*"

Write-Host "`n上传完成。请在 CDN 刷新缓存并测试 www 域名。`n" -ForegroundColor Green
