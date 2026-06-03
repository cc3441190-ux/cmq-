@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 构建三个作品 Demo
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\sync-demo-assets.ps1"
echo.
echo If sync fails, run build-unipass-export.ps1 and push demos folder manually.
pause
