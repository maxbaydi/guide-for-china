@echo off
REM Запуск Expo из Windows для правильной работы с Android эмулятором

echo Установка переменных окружения для Android SDK...
set ANDROID_HOME=C:\Users\jerem\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=C:\Users\jerem\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator

echo.
echo Проверка подключенных Android устройств...
adb devices

echo.
echo Запуск Expo...
call npx expo start --clear

pause

