@echo off
REM Полная подготовка Android проекта для локальной сборки

echo.
echo 🔧 Полная подготовка Android проекта
echo.

cd mobile

REM Выбор окружения
echo 📝 Выберите окружение:
echo   1. Development (локальный сервер 192.168.31.88)
echo   2. Production (удаленный сервер mypns.com)
echo.
set /p ENV_CHOICE="Введите номер (по умолчанию 2): "

if "%ENV_CHOICE%"=="" set ENV_CHOICE=2

if "%ENV_CHOICE%"=="2" (
    echo.
    echo 🔄 Временное переключение на Production URLs...
    
    REM Сохраняем текущий .env
    if exist .env (
        copy /Y .env .env.backup >nul 2>&1
        echo ✅ Создана резервная копия .env
    )
    
    REM Копируем production конфиг
    copy /Y .env.production .env >nul 2>&1
    echo ✅ Используются Production URLs:
    echo    - REST API: https://mypns.com/api/v1
    echo    - GraphQL: https://mypns.com/graphql
    echo.
) else (
    echo.
    echo 🏠 Используются Development URLs:
    echo    - REST API: http://192.168.31.88:4000/api/v1
    echo    - GraphQL: http://192.168.31.88:4002/graphql
    echo.
)

echo 🗑️  Очистка старых файлов...
if exist android rmdir /s /q android
if exist ios rmdir /s /q ios
echo.

echo 🔨 Генерация нативных файлов Android...
echo    Это займет несколько минут...
echo.
call npx expo prebuild --platform android --clean
if %errorlevel% neq 0 (
    echo ❌ Ошибка генерации проекта
    
    REM Восстанавливаем .env
    if exist .env.backup (
        copy /Y .env.backup .env >nul 2>&1
        del .env.backup >nul 2>&1
    )
    
    pause
    exit /b 1
)

echo.
echo ✅ Android проект успешно создан!
echo.
echo 📂 Создана папка android/ с полным нативным проектом
echo.
echo 📱 Теперь можно:
echo   1. Открыть проект в Android Studio: android/
echo   2. Запустить локальную сборку: build-local-android.bat
echo   3. Или собрать через: cd android ^&^& gradlew.bat assembleRelease
echo.

REM Восстанавливаем .env если был backup
if exist .env.backup (
    echo 🔄 Восстановление исходного .env...
    copy /Y .env.backup .env >nul 2>&1
    del .env.backup >nul 2>&1
    echo ✅ Файл .env восстановлен
    echo.
)

pause


