@echo off
REM Локальная сборка Android приложения через Gradle/Android Studio

echo.
echo 🏗️  Локальная сборка Android приложения
echo.
echo 📋 Требования:
echo   - Android Studio установлен
echo   - Android SDK настроен (ANDROID_HOME)
echo   - Java JDK 17 или выше
echo   - Node.js и npm
echo.

cd mobile

REM Проверка ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    echo ❌ Ошибка: ANDROID_HOME не установлен!
    echo.
    echo Установите переменную окружения ANDROID_HOME:
    echo   Например: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo.
    echo Или в PowerShell:
    echo   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\%USERNAME%\AppData\Local\Android\Sdk', 'User'^)
    echo.
    pause
    exit /b 1
)

echo ✅ ANDROID_HOME: %ANDROID_HOME%
echo.

REM Выбор окружения
echo 📝 Выберите окружение:
echo   1. Development (локальный сервер 192.168.31.88)
echo   2. Production (удаленный сервер mypns.com)
echo.
set /p ENV_CHOICE="Введите номер (по умолчанию 1): "

if "%ENV_CHOICE%"=="" set ENV_CHOICE=1

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

REM Проверка Java
echo 🔍 Проверка Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ошибка: Java не найдена!
    echo    Установите JDK 17 или выше
    pause
    exit /b 1
)
java -version
echo.

REM Установка зависимостей
echo 📦 Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo.

REM Очистка предыдущих сборок
echo 🧹 Очистка предыдущих сборок...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
echo.

REM Генерация нативных файлов (если еще не сгенерированы)
echo 🔧 Генерация нативных файлов...
call npx expo prebuild --platform android --clean
if %errorlevel% neq 0 (
    echo ❌ Ошибка prebuild
    pause
    exit /b 1
)
echo.

REM Выбор типа сборки
echo 📝 Выберите тип сборки:
echo   1. Debug (быстрая сборка, с отладкой)
echo   2. Release (оптимизированная, для распространения)
echo   3. Bundle (AAB для Google Play)
echo.
set /p BUILD_TYPE="Введите номер (по умолчанию 2): "

if "%BUILD_TYPE%"=="" set BUILD_TYPE=2
if "%BUILD_TYPE%"=="1" goto DEBUG_BUILD
if "%BUILD_TYPE%"=="3" goto BUNDLE_BUILD

:RELEASE_BUILD
echo.
echo 🔨 Сборка Release APK...
cd android
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки Release
    cd ..
    pause
    exit /b 1
)
echo.
echo ✅ Release APK собран!
echo.
echo 📱 APK находится в:
echo    android\app\build\outputs\apk\release\app-release.apk
echo.
echo 📋 Размер APK:
for %%A in (app\build\outputs\apk\release\app-release.apk) do echo    %%~zA байт
cd ..
goto END

:DEBUG_BUILD
echo.
echo 🔨 Сборка Debug APK...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки Debug
    cd ..
    pause
    exit /b 1
)
echo.
echo ✅ Debug APK собран!
echo.
echo 📱 APK находится в:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo.
cd ..
goto END

:BUNDLE_BUILD
echo.
echo 🔨 Сборка Release Bundle (AAB)...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки Bundle
    cd ..
    pause
    exit /b 1
)
echo.
echo ✅ Release Bundle собран!
echo.
echo 📱 AAB находится в:
echo    android\app\build\outputs\bundle\release\app-release.aab
echo.
cd ..
goto END

:END
echo.
echo 🎉 Сборка завершена!
echo.
echo 📱 Следующие шаги:
echo   1. Подключите Android устройство или запустите эмулятор
echo   2. Установите APK: adb install [путь к APK]
echo   3. Или перетащите APK на эмулятор
echo.
echo 🔍 Полезные команды:
echo   - Список устройств: adb devices
echo   - Установка: adb install -r android\app\build\outputs\apk\release\app-release.apk
echo   - Логи: adb logcat ^| findstr HanGuide
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

