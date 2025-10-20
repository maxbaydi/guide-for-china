@echo off
echo ========================================
echo   Starting Expo for Development
echo   with Expo Go App
echo ========================================
echo.
echo Choose mode:
echo   1. Local network (fastest, same WiFi required)
echo   2. Tunnel (works anywhere, slower)
echo   3. Clear cache and start
echo.

set /p choice="Enter choice (1-3): "

cd %~dp0

if "%choice%"=="1" (
    echo.
    echo Starting on LOCAL NETWORK...
    echo 1. Install Expo Go from Play Store/App Store
    echo 2. Scan QR code with Expo Go app
    echo.
    npm start
) else if "%choice%"=="2" (
    echo.
    echo Starting with TUNNEL...
    echo This may take a minute to connect...
    echo 1. Install Expo Go from Play Store/App Store
    echo 2. Scan QR code with Expo Go app
    echo.
    npm run start:tunnel
) else if "%choice%"=="3" (
    echo.
    echo Clearing cache and starting...
    npm run reset
) else (
    echo Invalid choice!
    pause
)

