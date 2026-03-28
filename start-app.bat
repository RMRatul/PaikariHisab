@echo off
setlocal
title Wholesale ERP System
color 0b

echo ==============================================
echo  Starting Wholesale ERP System...
echo ==============================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo [INFO] Please install Node.js using the included installer:
    echo        node-v22.14.0-x64.msi
    echo.
    echo After installing, please close this window and run start-app.bat again.
    pause
    exit /b
)

:: Ensure database is ready (Prisma generate was already done)
echo [INFO] Ready to start the server...
echo [INFO] Loading production build...
echo.

:: Start the Next.js app in a separate minimized window
start "ERP Server" /min cmd /c "npm run start"

:: Wait for server to start
echo [INFO] Waiting for server to start (5 seconds)...
timeout /t 5 /nobreak > nul

:: Open default browser
echo [INFO] Opening website...
start http://localhost:3000

echo.
echo ==============================================
echo  Application is running! 
echo  Keep the server window (minimized) open.
echo  Closing it will stop the website.
echo ==============================================
pause
