#!/bin/bash
# Скрипт для экспорта SSL сертификата с сервера

echo "========================================"
echo "Экспорт SSL сертификата с сервера"
echo "========================================"
echo

echo "Получение сертификата с 81.177.136.22:8443..."
echo | openssl s_client -connect 81.177.136.22:8443 -servername 81.177.136.22 2>/dev/null | openssl x509 -out server-certificate.crt

if [ -f "server-certificate.crt" ]; then
    echo "✓ Сертификат сохранен в server-certificate.crt"
    echo
    echo "Информация о сертификате:"
    openssl x509 -in server-certificate.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
    echo
    echo "========================================"
    echo "Как установить сертификат на Android:"
    echo "========================================"
    echo "1. Отправьте файл server-certificate.crt на устройство"
    echo "   (через email, мессенджер или USB)"
    echo
    echo "2. На Android устройстве:"
    echo "   - Откройте Настройки"
    echo "   - Безопасность → Расширенные настройки"
    echo "   - Шифрование и учетные данные"
    echo "   - Установить из хранилища"
    echo "   - Выберите файл server-certificate.crt"
    echo "   - Дайте имя сертификату (например: HanGuide Server)"
    echo "   - Выберите 'Использование сертификата: VPN и приложения'"
    echo
    echo "3. После установки перезапустите приложение HanGuide"
    echo "========================================"
else
    echo "✗ Ошибка при получении сертификата"
    exit 1
fi

