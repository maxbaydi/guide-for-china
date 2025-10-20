@echo off
echo ========================================
echo Получение логов Android для диагностики
echo ========================================
echo.

echo Очистка старых логов...
adb logcat -c

echo.
echo Запустите приложение и попробуйте зарегистрироваться
echo Затем нажмите любую клавишу для сбора логов...
pause

echo.
echo Сбор логов...
adb logcat -d | findstr /I "HanGuide API GraphQL Network SSL certificate https 81.177.136.22" > hanguide-logs.txt

echo.
echo Логи сохранены в hanguide-logs.txt
echo.
echo Последние 50 строк:
echo ========================================
tail -50 hanguide-logs.txt

echo.
echo ========================================
echo Ищем ошибки SSL/Network:
findstr /I "SSL certificate error network" hanguide-logs.txt

pause


