@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ========================================
echo   推送到 GitHub（供 Vercel 自动部署）
echo  ========================================
echo.
echo  使用前请先在 GitHub 创建空仓库：
echo  https://github.com/new
echo  - 仓库名建议：cmq-portfolio
echo  - 不要勾选 README / .gitignore
echo.

set /p REPO_URL=请粘贴仓库地址（如 https://github.com/你的用户名/cmq-portfolio.git）:

if "%REPO_URL%"=="" (
  echo 未输入地址，已取消。
  pause
  exit /b 1
)

git remote remove origin 2>nul
git remote add origin "%REPO_URL%"
git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo 推送失败。常见原因：
  echo  1. 仓库地址错误
  echo  2. 未登录 GitHub（需先在浏览器登录，或使用 GitHub Desktop）
  echo  3. 仓库不是空的且已有冲突
  pause
  exit /b 1
)

echo.
echo  推送成功！
echo  下一步：打开 https://vercel.com/new
echo  - Import 刚推送的 GitHub 仓库
echo  - Framework 选 Other，直接 Deploy
echo.
pause
