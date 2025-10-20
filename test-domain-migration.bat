@echo off
setlocal enabledelayedexpansion

REM Test script for mypns.com domain migration
REM This script tests all endpoints with the new domain

echo ============================================
echo Testing mypns.com domain configuration
echo ============================================
echo.

REM Test DNS resolution
echo 1. Testing DNS Resolution:
echo    Resolving mypns.com...
nslookup mypns.com >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] DNS resolution successful
) else (
    echo    [FAIL] DNS resolution failed
    echo    Please check your domain configuration
    pause
    exit /b 1
)
echo.

REM Test HTTPS endpoints
echo 2. Testing HTTPS Endpoints:

echo    Testing API Gateway Health...
curl -s -k https://mypns.com/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] API Gateway Health
) else (
    echo    [FAIL] API Gateway Health
)

echo    Testing API v1 Health...
curl -s -k https://mypns.com/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] API v1 Health
) else (
    echo    [FAIL] API v1 Health
)

echo    Testing GraphQL endpoint...
curl -s -k -X POST https://mypns.com/graphql -H "Content-Type: application/json" -d "{\"query\":\"{__typename}\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] GraphQL endpoint
) else (
    echo    [FAIL] GraphQL endpoint
)
echo.

REM Test specific services
echo 3. Testing Service Endpoints:

echo    Testing Dictionary Service...
curl -s -k https://mypns.com/api/v1/dictionary/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] Dictionary Service
) else (
    echo    [FAIL] Dictionary Service
)

echo    Testing Auth Service...
curl -s -k https://mypns.com/api/v1/auth/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] Auth Service
) else (
    echo    [FAIL] Auth Service
)

echo    Testing TTS Service...
curl -s -k https://mypns.com/api/v1/tts/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] TTS Service
) else (
    echo    [FAIL] TTS Service
)
echo.

REM Test CORS
echo 4. Testing CORS Headers:
echo    Checking CORS configuration...
curl -s -I -k -X OPTIONS https://mypns.com/api/v1/health -H "Origin: http://localhost:8080" -H "Access-Control-Request-Method: GET" | findstr /i "access-control" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [PASS] CORS headers present
) else (
    echo    [WARN] No CORS headers found
)
echo.

echo ============================================
echo Summary:
echo ============================================
echo.
echo Domain: mypns.com
echo API Base URL: https://mypns.com/api/v1
echo GraphQL URL: https://mypns.com/graphql
echo.
echo Note: If using self-signed certificates, mobile apps
echo need to be configured to trust them.
echo.
echo Next steps:
echo 1. Update server configuration with the new domain
echo 2. Deploy the updated .env.prod file to the server
echo 3. Restart Docker services
echo 4. Rebuild mobile app with new configuration
echo.
pause


