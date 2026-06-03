@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 构建三个作品 Demo
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\build-demos.ps1"
pause
