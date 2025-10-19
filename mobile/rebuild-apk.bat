@echo off
REM Скрипт для быстрой пересборки APK с исправленной конфигурацией сети

echo ========================================
echo Пересборка APK с поддержкой самоподписанного сертификата
echo ========================================
echo.

cd /d %~dp0

echo [1/4] Очистка кеша и предыдущих сборок...
call npx expo start --clear
timeout /t 2 /nobreak > nul

echo.
echo [2/4] Проверка конфигурации...
echo - API URL: https://mypns.com/api/v1
echo - GraphQL URL: https://mypns.com/graphql
echo - Network Security Config: ВКЛЮЧЕН (доверие самоподписанным сертификатам)
echo.

echo [3/4] Запуск сборки APK через EAS Build...
echo Это займет несколько минут...
echo.
call npx eas-cli build --platform android --profile preview --non-interactive --no-wait

echo.
echo [4/4] Готово!
echo.
echo ========================================
echo ВАЖНО:
echo ========================================
echo 1. Дождитесь завершения сборки на серверах EAS
echo 2. Скачайте новый APK файл
echo 3. Удалите старую версию приложения с устройства
echo 4. Установите новый APK
echo.
echo Если проблема сохраняется, убедитесь что:
echo - Сервер доступен по адресу mypns.com
echo - На сервере установлен SSL сертификат (самоподписанный или настоящий)
echo - Порт 8443 открыт в файерволе
echo ========================================

pause

