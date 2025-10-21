#!/bin/bash

# Локальная сборка Android приложения через Gradle/Android Studio

set -e

echo ""
echo "🏗️  Локальная сборка Android приложения"
echo ""
echo "📋 Требования:"
echo "  - Android Studio установлен"
echo "  - Android SDK настроен (ANDROID_HOME)"
echo "  - Java JDK 17 или выше"
echo "  - Node.js и npm"
echo ""

cd mobile

# Проверка ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Ошибка: ANDROID_HOME не установлен!"
    echo ""
    echo "Установите переменную окружения ANDROID_HOME:"
    echo "  Добавьте в ~/.bashrc или ~/.zshrc:"
    echo "    export ANDROID_HOME=\$HOME/Android/Sdk"
    echo "    export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "    export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo ""
    echo "  Затем выполните: source ~/.bashrc (или ~/.zshrc)"
    echo ""
    exit 1
fi

echo "✅ ANDROID_HOME: $ANDROID_HOME"
echo ""

# Функция для проверки и исправления поврежденных Build Tools
cleanup_corrupted_build_tools() {
    echo "🔍 Проверка целостности Build Tools..."
    
    local corrupted_found=false
    
    if [ -d "$ANDROID_HOME/build-tools" ]; then
        for version_dir in "$ANDROID_HOME/build-tools"/*; do
            if [ -d "$version_dir" ]; then
                version=$(basename "$version_dir")
                if [ ! -f "$version_dir/aapt" ] && [ ! -f "$version_dir/aapt.exe" ]; then
                    echo "⚠️  Build Tools $version повреждены (отсутствует aapt)"
                    rm -rf "$version_dir"
                    echo "✅ Build Tools $version удалены"
                    corrupted_found=true
                fi
            fi
        done
    fi
    
    if [ "$corrupted_found" = true ]; then
        echo "✅ Поврежденные Build Tools очищены"
        echo ""
    fi
}

cleanup_corrupted_build_tools

echo ""

# Выбор окружения
echo "📝 Выберите окружение:"
echo "  1. Development (локальный сервер 192.168.31.88)"
echo "  2. Production (удаленный сервер mypns.com)"
echo ""
read -p "Введите номер (по умолчанию 1): " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

if [ "$ENV_CHOICE" = "2" ]; then
    echo ""
    echo "🔄 Временное переключение на Production URLs..."
    
    # Сохраняем текущий .env
    if [ -f .env ]; then
        cp .env .env.backup
        echo "✅ Создана резервная копия .env"
    fi
    
    # Копируем production конфиг
    cp .env.production .env
    echo "✅ Используются Production URLs:"
    echo "   - REST API: https://mypns.com/api/v1"
    echo "   - GraphQL: https://mypns.com/graphql"
    echo ""
else
    echo ""
    echo "🏠 Используются Development URLs:"
    echo "   - REST API: http://192.168.31.88:4000/api/v1"
    echo "   - GraphQL: http://192.168.31.88:4002/graphql"
    echo ""
fi

# Проверка Java
echo "🔍 Проверка Java..."
if ! command -v java &> /dev/null; then
    echo "❌ Ошибка: Java не найдена!"
    echo "   Установите JDK 17 или выше"
    exit 1
fi
java -version
echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
echo ""

# Очистка предыдущих сборок
echo "🧹 Очистка предыдущих сборок..."
rm -rf android/app/build
rm -rf android/build
echo ""

# Генерация нативных файлов
echo "🔧 Генерация нативных файлов..."
npx expo prebuild --platform android --clean
echo ""

# Выбор типа сборки
echo "📝 Выберите тип сборки:"
echo "  1. Debug (быстрая сборка, с отладкой)"
echo "  2. Release (оптимизированная, для распространения)"
echo "  3. Bundle (AAB для Google Play)"
echo ""
read -p "Введите номер (по умолчанию 2): " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-2}

case $BUILD_TYPE in
    1)
        echo ""
        echo "🔨 Сборка Debug APK..."
        cd android
        ./gradlew assembleDebug
        cd ..
        echo ""
        echo "✅ Debug APK собран!"
        echo ""
        echo "📱 APK находится в:"
        echo "   android/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
        APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
        ;;
    3)
        echo ""
        echo "🔨 Сборка Release Bundle (AAB)..."
        cd android
        ./gradlew bundleRelease
        cd ..
        echo ""
        echo "✅ Release Bundle собран!"
        echo ""
        echo "📱 AAB находится в:"
        echo "   android/app/build/outputs/bundle/release/app-release.aab"
        echo ""
        APK_PATH="android/app/build/outputs/bundle/release/app-release.aab"
        ;;
    *)
        echo ""
        echo "🔨 Сборка Release APK..."
        cd android
        if ! ./gradlew assembleRelease; then
            echo ""
            echo "❌ Ошибка сборки!"
            echo ""
            echo "💡 Возможные решения:"
            echo "  1. Проверьте целостность Build Tools: rm -rf \$ANDROID_HOME/build-tools/*/aapt"
            echo "  2. Очистите кэш Gradle: ./gradlew clean"
            echo "  3. Обновите SDK Manager через Android Studio"
            echo ""
            exit 1
        fi
        cd ..
        echo ""
        echo "✅ Release APK собран!"
        echo ""
        echo "📱 APK находится в:"
        echo "   android/app/build/outputs/apk/release/app-release.apk"
        echo ""
        APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
        
        if [ -f "$APK_PATH" ]; then
            SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
            echo "📋 Размер APK: $SIZE"
        fi
        ;;
esac

echo ""
echo "🎉 Сборка завершена!"
echo ""
echo "📱 Следующие шаги:"
echo "  1. Подключите Android устройство или запустите эмулятор"
echo "  2. Установите APK: adb install $APK_PATH"
echo "  3. Или перетащите APK на эмулятор"
echo ""
echo "🔍 Полезные команды:"
echo "  - Список устройств: adb devices"
echo "  - Установка: adb install -r $APK_PATH"
echo "  - Логи: adb logcat | grep HanGuide"
echo "  - Запуск: adb shell am start -n com.hanguide.app/.MainActivity"
echo ""

# Восстанавливаем .env если был backup
if [ -f .env.backup ]; then
    echo "🔄 Восстановление исходного .env..."
    cp .env.backup .env
    rm .env.backup
    echo "✅ Файл .env восстановлен"
    echo ""
fi

