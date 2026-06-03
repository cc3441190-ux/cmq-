@echo off
REM 双击时强制新开一个保持打开的命令行窗口
if /i not "%~1"=="run" (
  start "推送到 GitHub" cmd /k "%~f0" run
  exit /b
)

chcp 65001 >nul
cd /d "%~dp0"
title 推送到 GitHub

echo.
echo  ========================================
echo   推送到 GitHub（供 Vercel 自动部署）
echo  ========================================
echo.

set "REPO_URL=https://github.com/cc3441190-ux/cmq-.git"

echo 将推送到: %REPO_URL%
echo.
echo 提示：若本窗口一闪就消失，说明点错了位置。
echo 请从【文件夹】里双击本文件，不要在 Cursor 编辑器里点。
echo.
pause

where git >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 Git，请先安装: https://git-scm.com/download/win
  pause
  exit /b 1
)

echo [1/4] 检查 Git 状态...
git status -sb
echo.

echo [2/4] 设置远程仓库...
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"
git branch -M main
echo.

echo [3/4] 正在推送（需能访问 GitHub，约 1~3 分钟）...
echo  若失败，请先开 VPN 或换网络后再试。
echo.
git -c http.postBuffer=524288000 push -u origin main
set PUSH_ERR=%ERRORLEVEL%
echo.

if not "%PUSH_ERR%"=="0" (
  echo [失败] 推送未成功，错误码: %PUSH_ERR%
  echo.
  echo 常见原因：
  echo  1. 网络连不上 github.com —— 需要 VPN 或换网络
  echo  2. 未登录 GitHub —— 浏览器先打开 github.com 登录
  echo  3. 仓库不存在 —— 确认已创建 https://github.com/cc3441190-ux/cmq-
  echo.
  pause
  exit /b 1
)

echo [4/4] 推送成功！请刷新 GitHub 页面查看代码。
echo  下一步: https://vercel.com/new 导入 cmq- 仓库
echo.
pause
