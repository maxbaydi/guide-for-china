#!/bin/bash
# Скрипт установки Let's Encrypt сертификата на сервер

echo "========================================"
echo "Установка Let's Encrypt SSL сертификата"
echo "========================================"
echo
echo "ВАЖНО: Для работы Certbot нужен домен!"
echo "Если у вас только IP адрес (81.177.136.22),"
echo "Let's Encrypt НЕ выдаст сертификат."
echo
echo "Варианты решения:"
echo "1. Использовать домен (если есть)"
echo "2. Использовать ZeroSSL (работает с IP)"
echo "3. Использовать самоподписанный сертификат"
echo "   с правильной конфигурацией"
echo
echo "========================================"
echo
echo "Если у вас есть домен, выполните на сервере:"
echo
echo "# 1. Установка Certbot"
echo "sudo apt update"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo
echo "# 2. Получение сертификата"
echo "sudo certbot certonly --standalone -d yourdomain.com"
echo
echo "# 3. Обновление nginx конфигурации"
echo "# В файле nginx/nginx.conf измените:"
echo "ssl_certificate /path/to/fullchain.pem;"
echo "ssl_certificate_key /path/to/privkey.pem;"
echo
echo "========================================"
echo "Для IP адреса используйте ZeroSSL:"
echo "========================================"
echo
echo "1. Установите acme.sh:"
echo "curl https://get.acme.sh | sh"
echo
echo "2. Получите сертификат для IP:"
echo "~/.acme.sh/acme.sh --issue -d 81.177.136.22 --standalone --server zerossl"
echo
echo "========================================"


