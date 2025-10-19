@echo off
REM Скрипт для быстрой сборки Android приложения с исправлением сетевой проблемы

echo.
echo 🚀 Сборка Android приложения через EAS Build
echo.
echo 📝 Изменения:
echo   ✅ Добавлен network_security_config.xml для разрешения HTTP
echo   ✅ Обновлен AndroidManifest.xml
echo   ✅ Обновлен app.json
echo.
echo ⚠️  ВНИМАНИЕ: Это временное решение для тестирования!
echo    Для production необходимо настроить HTTPS.
echo    См. mobile\NETWORK_FIX.md для подробностей.
echo.

cd mobile

echo 🔨 Запуск EAS Build...
call eas build --profile production --platform android

echo.
echo ✅ Сборка завершена!
echo.
echo 📱 Следующие шаги:
echo   1. Скачать APK по ссылке выше
echo   2. Установить на устройство
echo   3. Проверить регистрацию/вход
echo.
echo 🔍 Если проблемы с сетью остались:
echo   - Проверьте логи в консоли приложения
echo   - Убедитесь, что сервер доступен: curl https://mypns.com/health
echo   - Проверьте firewall на сервере
echo.
pause


