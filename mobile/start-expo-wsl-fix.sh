#!/bin/bash
# Скрипт для настройки ADB моста между WSL и Windows

echo "🔧 Настройка ADB для WSL..."

# Останавливаем ADB сервер в WSL (если запущен)
if command -v adb &> /dev/null; then
    adb kill-server 2>/dev/null
fi

# Настраиваем переменные окружения
export ANDROID_HOME="/mnt/c/Users/jerem/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="/mnt/c/Users/jerem/AppData/Local/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

# Создаем alias для использования Windows ADB
alias adb="$ANDROID_HOME/platform-tools/adb.exe"

echo "✅ Переменные окружения установлены"
echo "ANDROID_HOME: $ANDROID_HOME"

# Проверяем подключенные устройства
echo ""
echo "📱 Проверка Android устройств..."
"$ANDROID_HOME/platform-tools/adb.exe" devices

echo ""
echo "🚀 Запуск Expo..."
cd /mnt/c/Users/jerem/OneDrive/Документы/guide-for-china/mobile
npx expo start --clear


