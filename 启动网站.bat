@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  正在启动个人求职网站（已禁用浏览器缓存）...
echo  请在浏览器打开: http://localhost:5500/
echo  按 Ctrl+C 可关闭服务
echo.
python scripts\dev-server.py
