@echo off
echo 🚀 Initializing GitHub Repository...
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed. Please install Git first.
    exit /b 1
)

REM Check if already a git repository
if exist ".git" (
    echo ⚠️  This is already a git repository.
    set /p continue="Do you want to continue? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    REM Initialize git
    echo 📝 Initializing git repository...
    git init
)

REM Add all files
echo 📦 Adding files to git...
git add .

REM Create initial commit
echo 💾 Creating initial commit...
git commit -m "Initial commit - E-Commerce Platform ready for deployment"

REM Rename branch to main
echo 🔄 Renaming branch to main...
git branch -M main

echo.
echo ✅ Git repository initialized!
echo.
echo 📋 Next steps:
echo 1. Create a new repository on GitHub: https://github.com/new
echo 2. Copy the repository URL (e.g., https://github.com/username/repo-name.git)
echo 3. Run these commands:
echo.
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git push -u origin main
echo.
echo 4. Then follow DEPLOYMENT.md to deploy to Vercel

pause
