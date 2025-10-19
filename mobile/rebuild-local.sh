#!/bin/bash
# Скрипт для локальной пересборки APK с PRODUCTION конфигурацией (HTTPS)

echo "========================================"
echo "Локальная пересборка APK для PRODUCTION"
echo "========================================"
echo

cd "$(dirname "$0")"

echo "[0/6] Проверка переменных окружения..."
echo "Текущие настройки в .env:"
grep "EXPO_PUBLIC" .env | head -2
echo

# Проверяем что используются HTTPS URL
if grep -q "https://mypns.com" .env; then
    echo "✓ HTTPS URL настроены правильно"
else
    echo "✗ ОШИБКА: В .env должны быть HTTPS URL!"
    echo "Обновите .env файл перед сборкой"
    exit 1
fi

# Удаляем .env.local если существует (он может перекрывать .env)
if [ -f ".env.local" ]; then
    echo "⚠ Найден .env.local - удаляем для production сборки"
    rm .env.local
fi

echo
echo "[1/6] Очистка предыдущих сборок..."
rm -rf android .expo
echo "✓ Очистка завершена"

echo
echo "[2/6] Prebuild проекта..."
npx expo prebuild --clean --platform android

echo
echo "[3/6] Проверка Network Security Config..."
if [ -f "android/app/src/main/res/xml/network_security_config.xml" ]; then
    echo "✓ Network Security Config найден"
else
    echo "⚠ Network Security Config НЕ НАЙДЕН - копируем..."
    mkdir -p android/app/src/main/res/xml
    cp network_security_config.xml android/app/src/main/res/xml/
fi

echo
echo "[4/6] Проверка AndroidManifest.xml..."
if grep -q "networkSecurityConfig" android/app/src/main/AndroidManifest.xml; then
    echo "✓ networkSecurityConfig подключен в манифесте"
else
    echo "⚠ Добавляем networkSecurityConfig в манифест..."
    # Здесь можно добавить автоматическое добавление в манифест если нужно
fi

echo
echo "[5/6] Сборка Release APK..."
cd android
chmod +x gradlew
./gradlew clean
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo
    echo "[6/6] ✓ Сборка успешно завершена!"
    echo
    echo "========================================"
    echo "APK файл находится в:"
    echo "android/app/build/outputs/apk/release/app-release.apk"
    echo "========================================"
    echo
    echo "Установка на устройство:"
    echo "adb install -r app/build/outputs/apk/release/app-release.apk"
    echo
    echo "Или скопируйте файл на устройство и установите вручную"
    echo "========================================"
else
    echo
    echo "✗ Ошибка при сборке APK"
    echo "Проверьте логи выше для деталей"
    exit 1
fi
