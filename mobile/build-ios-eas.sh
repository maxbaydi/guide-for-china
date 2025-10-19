#!/bin/bash

# Сборка iOS приложения через EAS Expo сервис

set -e

echo ""
echo "🍎 Сборка iOS приложения через EAS Expo"
echo ""
echo "📋 Требования:"
echo "  - EAS CLI установлен (npm install -g @expo/eas-cli)"
echo "  - Expo аккаунт настроен (eas login)"
echo "  - Apple Developer аккаунт"
echo "  - iOS сертификаты настроены"
echo ""

cd mobile

# Проверка EAS CLI
echo "🔍 Проверка EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "❌ Ошибка: EAS CLI не найден!"
    echo ""
    echo "Установите EAS CLI:"
    echo "  npm install -g @expo/eas-cli"
    echo ""
    echo "Затем выполните:"
    echo "  eas login"
    echo ""
    exit 1
fi

# Проверка авторизации в EAS
echo "🔐 Проверка авторизации в EAS..."
if ! eas whoami &> /dev/null; then
    echo "❌ Ошибка: Не авторизованы в EAS!"
    echo ""
    echo "Выполните авторизацию:"
    echo "  eas login"
    echo ""
    exit 1
fi

echo "✅ EAS CLI установлен и авторизован"
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

# Проверка eas.json
echo "🔍 Проверка конфигурации EAS..."
if [ ! -f eas.json ]; then
    echo "❌ Ошибка: Файл eas.json не найден!"
    echo ""
    echo "Создайте конфигурацию EAS:"
    echo "  eas build:configure"
    echo ""
    exit 1
fi

echo "✅ Конфигурация EAS найдена"
echo ""

# Выбор типа сборки
echo "📝 Выберите тип сборки:"
echo "  1. Development (dev client для разработки)"
echo "  2. Preview (внутреннее тестирование)"
echo "  3. Production (для App Store)"
echo ""
read -p "Введите номер (по умолчанию 2): " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-2}

case $BUILD_TYPE in
    1)
        PROFILE="development"
        echo ""
        echo "🔨 Сборка Development iOS (dev client)..."
        echo "📱 Этот тип сборки создает dev client для разработки"
        echo ""
        ;;
    3)
        PROFILE="production"
        echo ""
        echo "🔨 Сборка Production iOS для App Store..."
        echo "📱 Этот тип сборки готов для публикации в App Store"
        echo ""
        ;;
    *)
        PROFILE="preview"
        echo ""
        echo "🔨 Сборка Preview iOS для внутреннего тестирования..."
        echo "📱 Этот тип сборки подходит для тестирования через TestFlight"
        echo ""
        ;;
esac

# Проверка iOS сертификатов
echo "🔐 Проверка iOS сертификатов..."
if ! eas credentials:configure-build --platform ios --profile $PROFILE --non-interactive &> /dev/null; then
    echo "⚠️  Предупреждение: iOS сертификаты могут быть не настроены"
    echo ""
    echo "Настройте сертификаты:"
    echo "  eas credentials:configure-build --platform ios --profile $PROFILE"
    echo ""
    read -p "Продолжить сборку? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "❌ Сборка отменена"
        exit 1
    fi
else
    echo "✅ iOS сертификаты настроены"
fi

echo ""

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install
echo ""

# Очистка кэша
echo "🧹 Очистка кэша..."
npx expo install --fix
echo ""

# Запуск сборки
echo "🚀 Запуск сборки iOS через EAS..."
echo "📋 Профиль: $PROFILE"
echo "📱 Платформа: iOS"
echo ""

# Выбор дополнительных опций
echo "📝 Дополнительные опции:"
echo "  1. Обычная сборка"
echo "  2. Сборка с очисткой кэша"
echo "  3. Сборка с ожиданием завершения"
echo "  4. Сборка с очисткой кэша и ожиданием"
echo ""
read -p "Введите номер (по умолчанию 1): " OPTIONS_CHOICE
OPTIONS_CHOICE=${OPTIONS_CHOICE:-1}

BUILD_COMMAND="eas build --platform ios --profile $PROFILE"

case $OPTIONS_CHOICE in
    2)
        BUILD_COMMAND="$BUILD_COMMAND --clear-cache"
        echo "✅ Будет выполнена очистка кэша"
        ;;
    3)
        BUILD_COMMAND="$BUILD_COMMAND --wait"
        echo "✅ Будет ожидаться завершение сборки"
        ;;
    4)
        BUILD_COMMAND="$BUILD_COMMAND --clear-cache --wait"
        echo "✅ Будет выполнена очистка кэша и ожидание завершения"
        ;;
    *)
        echo "✅ Обычная сборка"
        ;;
esac

echo ""
echo "🔨 Выполняется команда: $BUILD_COMMAND"
echo ""

# Выполнение сборки
eval $BUILD_COMMAND

echo ""
echo "🎉 Сборка iOS завершена!"
echo ""
echo "📱 Следующие шаги:"
echo "  1. Проверьте статус сборки: eas build:list"
echo "  2. Скачайте сборку: eas build:download [BUILD_ID]"
echo "  3. Для TestFlight: eas build:submit --platform ios"
echo ""
echo "🔍 Полезные команды:"
echo "  - Список сборок: eas build:list"
echo "  - Скачать сборку: eas build:download [BUILD_ID]"
echo "  - Отправить в App Store: eas build:submit --platform ios"
echo "  - Настроить сертификаты: eas credentials:configure-build --platform ios"
echo ""

# Восстанавливаем .env если был backup
if [ -f .env.backup ]; then
    echo "🔄 Восстановление исходного .env..."
    cp .env.backup .env
    rm .env.backup
    echo "✅ Файл .env восстановлен"
    echo ""
fi

echo "📋 Информация о сборке:"
echo "  - Профиль: $PROFILE"
echo "  - Платформа: iOS"
echo "  - Статус: Завершена"
echo "  - Следующий шаг: Проверьте eas build:list для получения ссылки на сборку"
echo ""
