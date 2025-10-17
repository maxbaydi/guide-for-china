@echo off
echo ========================================
echo  HANGUIDE ANDROID APK BUILDER
echo ========================================

REM Переходим в директорию скрипта
cd /d "%~dp0"

REM Проверяем наличие Node.js
echo.
echo [1/6] Checking environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM Проверяем наличие Android SDK
if not defined ANDROID_HOME (
    echo Warning: ANDROID_HOME not set. Running setup script...
    call setup-env.bat
    if %errorlevel% neq 0 (
        echo Error: Failed to setup Android environment!
        pause
        exit /b 1
    )
)

echo Node.js: OK
echo Android SDK: OK

REM Устанавливаем зависимости если нужно
echo.
echo [2/6] Installing dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies!
        pause
        exit /b %errorlevel%
    )
) else (
    echo Dependencies already installed.
)

REM Копируем production environment
echo.
echo [3/6] Setting up production environment...
if exist ".env.production" (
    copy ".env.production" ".env" >nul
    echo Production environment loaded.
) else (
    echo Warning: .env.production not found, using default config.
)

REM Запускаем Expo prebuild
echo.
echo [4/6] Running Expo prebuild...
echo This will generate native Android project...
call npx expo prebuild --platform android --clean
if %errorlevel% neq 0 (
    echo Error: Expo prebuild failed!
    pause
    exit /b %errorlevel%
)

REM Проверяем что android директория создалась
if not exist "android" (
    echo Error: Android directory not created!
    pause
    exit /b 1
)

REM Собираем APK через Gradle
echo.
echo [5/6] Building Android APK...
echo This may take several minutes...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo Error: Gradle build failed!
    cd ..
    pause
    exit /b %errorlevel%
)

REM Возвращаемся в корень mobile
cd ..

REM Копируем готовый APK
echo.
echo [6/6] Copying APK...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "hanguide-debug.apk" >nul
    echo APK copied to: hanguide-debug.apk
) else (
    echo Error: APK file not found!
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! APK build complete
echo ========================================
echo.
echo APK location: %cd%\hanguide-debug.apk
echo.
echo You can now install this APK on your Android device or emulator.
echo.
pause
