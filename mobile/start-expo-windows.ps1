# Запуск Expo из Windows PowerShell для правильной работы с Android эмулятором

Write-Host "Установка переменных окружения для Android SDK..." -ForegroundColor Cyan
$env:ANDROID_HOME = "C:\Users\jerem\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\jerem\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"

Write-Host ""
Write-Host "Проверка подключенных Android устройств..." -ForegroundColor Cyan
adb devices

Write-Host ""
Write-Host "Запуск Expo..." -ForegroundColor Green
npx expo start --clear


