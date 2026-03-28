@echo off
title ERP Launcher
color 0b
cls

echo ==============================================
echo  WHITELABEL WHOLESALE ERP - Launcher
echo ==============================================
echo.

cd /d "%~dp0"

:: Check for node_modules
if not exist "node_modules\" (
    echo [INFO] First time setup, installing necessary files...
    call npm install
)

:: Prisma generation
echo [INFO] Preparing database...
call npx prisma generate >nul 2>&1

:: Start dev server in a new window
echo [INFO] Starting local server...
start "ERP Server" cmd /c "npm run dev"

:: Wait for server (approx 5-7 seconds)
echo [INFO] Waiting 5 seconds for server to initialize...
timeout /t 5 /nobreak > nul

:: Open browser
echo [INFO] Opening the application in Google Chrome...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:3000

echo.
echo ==============================================
echo  ERP is now active! 
echo  Keep this terminal window open. Closing it will 
echo  stop the ERP system.
echo ==============================================
echo.
pause
