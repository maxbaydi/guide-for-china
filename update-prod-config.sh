#!/bin/bash
# Скрипт для обновления production конфигурации и перезапуска сервисов

echo "========================================="
echo "Обновление production конфигурации"
echo "========================================="
echo

# Проверка изменений в .env.prod
echo "Изменения в .env.prod:"
echo "- DATABASE_URL: теперь использует postgres вместо 81.177.136.22"
echo "- REDIS_HOST: теперь использует redis вместо 81.177.136.22"
echo "- REDIS_URL: теперь использует redis://redis:6379"
echo

echo "Копирование .env.prod на сервер..."
scp .env.prod root@81.177.136.22:/root/guide-for-china/.env

echo
echo "Перезапуск Docker контейнеров на сервере..."
ssh root@81.177.136.22 "cd /root/guide-for-china && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"

echo
echo "Ожидание запуска сервисов (30 секунд)..."
sleep 30

echo
echo "Проверка работы API..."
curl -k https://81.177.136.22:8443/api/v1/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","username":"test","password":"Test1234!"}' -v

echo
echo "========================================="
echo "Готово! Проверьте работу приложения."
echo "========================================="

