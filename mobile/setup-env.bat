@echo off
REM Скрипт для поиска и установки ANDROID_HOME

echo ========================================
echo  ANDROID SDK ENVIRONMENT SETUP
echo ========================================
echo.

REM Проверяем стандартные места установки Android SDK
set "ANDROID_SDK_PATHS="
set "ANDROID_SDK_PATHS=%ANDROID_SDK_PATHS% C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
set "ANDROID_SDK_PATHS=%ANDROID_SDK_PATHS% C:\Android\sdk"
set "ANDROID_SDK_PATHS=%ANDROID_SDK_PATHS% %ProgramFiles%\Android\SDK"

echo Searching for Android SDK...
echo.

for %%P in (%ANDROID_SDK_PATHS%) do (
    if exist "%%P\platform-tools\adb.exe" (
        echo Found Android SDK at: %%P
        echo.
        echo Setting ANDROID_HOME...
        setx ANDROID_HOME "%%P"
        echo ANDROID_HOME set to: %%P
        echo.
        echo Please restart your terminal and try build-android.bat again.
        pause
        exit /b 0
    )
)

echo.
echo Error: Android SDK not found in common locations:
for %%P in (%ANDROID_SDK_PATHS%) do (
    echo   - %%P
)

echo.
echo Please install Android Studio first:
echo https://developer.android.com/studio
echo.
echo After installation, set ANDROID_HOME manually:
echo 1. Right-click "This PC" or "My Computer"
echo 2. Click "Properties"
echo 3. Click "Advanced system settings"
echo 4. Click "Environment Variables"
echo 5. Click "New" and add:
echo    Variable name: ANDROID_HOME
echo    Variable value: C:\Users\YourUsername\AppData\Local\Android\Sdk
echo.
pause
exit /b 1
