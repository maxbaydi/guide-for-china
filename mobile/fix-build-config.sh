#!/bin/bash
# ИНСТРУКЦИЯ: Как правильно пересобрать APK

echo "========================================="
echo "⚠️  ВАЖНО: Остановите текущую сборку!"
echo "========================================="
echo
echo "Нажмите Ctrl+C чтобы остановить текущий процесс"
echo
echo "ПРОБЛЕМА:"
echo "Сборка использовала HTTP URL вместо HTTPS:"
echo "  ❌ http://192.168.31.88:4000 (локальный сервер)"
echo "  ✅ https://mypns.com (production с SSL)"
echo
echo "========================================="
echo "ЧТО ДЕЛАТЬ:"
echo "========================================="
echo
echo "1. Остановите текущую сборку (Ctrl+C)"
echo
echo "2. Проверьте .env файл:"
echo "   cat .env | grep EXPO_PUBLIC"
echo "   Должно быть:"
echo "   EXPO_PUBLIC_API_BASE_URL=https://mypns.com/api/v1"
echo "   EXPO_PUBLIC_GRAPHQL_URL=https://mypns.com/graphql"
echo
echo "3. Удалите .env.local если он существует:"
echo "   rm -f .env.local"
echo
echo "4. Запустите обновленный скрипт:"
echo "   ./rebuild-local.sh"
echo
echo "ИЛИ используйте EAS Build (проще):"
echo "   npx eas-cli build --platform android --profile preview"
echo
echo "========================================="
echo "ПРОВЕРКА ПОСЛЕ УСТАНОВКИ:"
echo "========================================="
echo
echo "После установки нового APK проверьте логи:"
echo "  adb logcat | grep -i 'API Client Configuration'"
echo
echo "Вы должны увидеть:"
echo "  Base URL: https://mypns.com/api/v1"
echo "  Self-signed certificate support: ENABLED"
echo
echo "========================================="

# Проверяем текущий .env
echo
echo "Текущее содержимое .env:"
if [ -f ".env" ]; then
    grep "EXPO_PUBLIC" .env
    echo
    if grep -q "https://mypns.com" .env; then
        echo "✅ .env файл настроен правильно"
    else
        echo "❌ .env файл содержит неправильные URL!"
        echo "   Должны быть https://mypns.com"
    fi
else
    echo "❌ Файл .env не найден!"
fi

# Проверяем .env.local
if [ -f ".env.local" ]; then
    echo
    echo "⚠️  ВНИМАНИЕ: Найден .env.local"
    echo "Он перекрывает настройки из .env!"
    echo "Содержимое:"
    grep "EXPO_PUBLIC" .env.local
    echo
    echo "Удалите его для production сборки:"
    echo "  rm .env.local"
fi

echo
echo "========================================="

