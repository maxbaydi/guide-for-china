@echo off
REM Проверяем установлена ли Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ❌ ОШИБКА: Node.js не установлен или не добавлен в PATH
    echo.
    echo Пожалуйста установите Node.js с https://nodejs.org/
    echo После установки перезагрузите командную строку и повторите попытку
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo 🚀 Запуск локального HTTP сервера для тестирования API
echo ════════════════════════════════════════════════════════════
echo.
echo 📍 Локальный сервер:       http://localhost:8080
echo 🔗 REST API продакшена:    https://mypns.com/api/v1
echo 🔗 GraphQL продакшена:     https://mypns.com/graphql
echo.
echo ✅ CORS будет обработан через локальный сервер
echo ⏹️  Нажмите Ctrl+C для остановки сервера
echo.
echo ════════════════════════════════════════════════════════════
echo.

node test-server.js

if errorlevel 1 (
    echo.
    echo ❌ Ошибка при запуске сервера
    echo.
    pause
    exit /b 1
)
