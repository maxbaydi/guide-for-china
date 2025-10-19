@echo off
REM Скрипт для проверки конфигурации перед сборкой APK

echo ========================================
echo Проверка конфигурации мобильного приложения
echo ========================================
echo.

cd /d %~dp0

echo [1/5] Проверка переменных окружения...
echo.
type .env
echo.

echo [2/5] Проверка network_security_config.xml...
if exist "network_security_config.xml" (
    echo ✓ Файл найден
    findstr /C:"mypns.com" network_security_config.xml >nul
    if %errorlevel% equ 0 (
        echo ✓ Домен mypns.com настроен
    ) else (
        echo ✗ Домен не найден в конфигурации!
    )
    findstr /C:"certificates src=\"user\"" network_security_config.xml >nul
    if %errorlevel% equ 0 (
        echo ✓ Доверие самоподписанным сертификатам включено
    ) else (
        echo ✗ Доверие самоподписанным сертификатам не настроено!
    )
) else (
    echo ✗ Файл network_security_config.xml не найден!
)
echo.

echo [3/5] Проверка app.config.js...
findstr /C:"networkSecurityConfig" app.config.js >nul
if %errorlevel% equ 0 (
    echo ✓ networkSecurityConfig подключен в app.config.js
) else (
    echo ✗ networkSecurityConfig НЕ подключен в app.config.js!
)
echo.

echo [4/5] Проверка доступности сервера...
echo Проверяем https://mypns.com/api/v1/health ...
curl -k -s https://mypns.com/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Сервер доступен
) else (
    echo ⚠ Сервер недоступен или требует проверки
)
echo.

echo [5/5] Проверка пакетов...
if exist "node_modules" (
    echo ✓ node_modules установлены
) else (
    echo ✗ node_modules не найдены! Выполните: npm install
)
echo.

echo ========================================
echo РЕЗЮМЕ
echo ========================================
echo.
echo Убедитесь что все проверки прошли успешно
echo перед началом сборки APK.
echo.
echo Если все ✓ - можете запускать сборку:
echo   rebuild-apk.bat  (для EAS Build)
echo.
echo Или локальную сборку:
echo   npx expo prebuild --clean
echo   cd android
echo   gradlew assembleRelease
echo.
echo ========================================

pause

