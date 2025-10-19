#!/bin/bash
# Установка SSL сертификата для IP адреса через ZeroSSL

echo "========================================"
echo "Установка SSL для IP 81.177.136.22"
echo "========================================"
echo
echo "Выполните эти команды на сервере:"
echo
echo "# 1. Установка acme.sh"
echo "cd ~"
echo "curl https://get.acme.sh | sh -s email=your@email.com"
echo
echo "# 2. Регистрация в ZeroSSL"
echo "~/.acme.sh/acme.sh --register-account -m your@email.com --server zerossl"
echo
echo "# 3. Получение сертификата для IP"
echo "~/.acme.sh/acme.sh --issue -d 81.177.136.22 --standalone --httpport 8080 --server zerossl"
echo
echo "# 4. Установка сертификата"
echo "mkdir -p /etc/nginx/ssl"
echo "~/.acme.sh/acme.sh --install-cert -d 81.177.136.22 \\"
echo "  --key-file /etc/nginx/ssl/key.pem \\"
echo "  --fullchain-file /etc/nginx/ssl/cert.pem \\"
echo "  --reloadcmd \"docker restart guide-nginx\""
echo
echo "========================================"

