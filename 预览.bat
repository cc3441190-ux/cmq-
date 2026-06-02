@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动本地预览（已禁用浏览器缓存）...
echo 请在浏览器打开: http://localhost:5500/
echo.
python scripts\dev-server.py
pause
