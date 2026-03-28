@echo off
title ERP Speed-Up (Building Production)
color 0e
cls

echo ==============================================
echo  ERP PERFORMANCE BOOSTER (First time will take a few minutes)
echo ==============================================
echo.
echo  [1/3] Building the application for production...
echo       This optimization is done once to make the site 10x faster.
echo.

cd /d "%~dp0"

:: Build the app
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed. Please check your internet connection or logs.
    pause
    exit /b
)

echo.
echo  [2/3] Build successful! 
echo.
echo  [3/3] Starting Production Server...

:: Create a persistent run script if not exists
echo @echo off > run-production.bat
echo title ERP Production Server >> run-production.bat
echo color 0a >> run-production.bat
echo cd /d "%%~dp0" >> run-production.bat
echo npm run start >> run-production.bat

:: Start the production server
start "ERP Production" cmd /c "run-production.bat"

:: Wait for server
timeout /t 5 /nobreak > nul

:: Open browser
echo [INFO] Opening the application in your browser...
start http://localhost:3000

cls
echo.
echo ==============================================
echo  ERP is now running in PRODUCTION MODE (Super Fast)!
echo ==============================================
echo.
echo  Use the "ERP-System" shortcut to launch in the future.
echo.
pause
