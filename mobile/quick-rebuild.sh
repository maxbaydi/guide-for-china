#!/bin/bash
# Быстрая пересборка после исправления network_security_config.xml

echo "========================================="
echo "Пересборка APK после исправления"
echo "========================================="
echo

cd "$(dirname "$0")"

echo "[1/3] Копирование исправленного network_security_config.xml..."
mkdir -p android/app/src/main/res/xml
cp network_security_config.xml android/app/src/main/res/xml/
echo "✓ Файл скопирован"

echo
echo "[2/3] Очистка предыдущей сборки..."
cd android
./gradlew clean
echo "✓ Очистка завершена"

echo
echo "[3/3] Сборка Release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo
    echo "========================================="
    echo "✅ Сборка успешно завершена!"
    echo "========================================="
    echo
    echo "APK файл:"
    ls -lh app/build/outputs/apk/release/app-release.apk
    echo
    echo "Установка на устройство:"
    echo "  adb install -r app/build/outputs/apk/release/app-release.apk"
    echo
    echo "Или скопируйте на устройство:"
    echo "  app/build/outputs/apk/release/app-release.apk"
    echo "========================================="
else
    echo
    echo "❌ Ошибка при сборке"
    exit 1
fi


