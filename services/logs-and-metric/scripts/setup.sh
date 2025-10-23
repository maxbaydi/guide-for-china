#!/bin/bash

# =============================================================================
# Скрипт первоначальной настройки системы мониторинга
# =============================================================================

set -e

echo "🚀 Настройка системы мониторинга Promtail-Prometheus-Loki-Grafana"
echo "=================================================================="

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker и попробуйте снова."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose и попробуйте снова."
    exit 1
fi

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Создание файла .env из шаблона..."
    cp .env.example .env
    echo "✅ Файл .env создан. Отредактируйте его под ваши нужды."
else
    echo "✅ Файл .env уже существует."
fi

# Создаем необходимые директории для данных
echo "📁 Создание директорий для данных..."
mkdir -p data/loki data/prometheus data/grafana
echo "✅ Директории созданы."

# Проверяем права доступа к Docker socket
if [ ! -r /var/run/docker.sock ]; then
    echo "⚠️  Предупреждение: Нет доступа к Docker socket (/var/run/docker.sock)"
    echo "   Promtail может не работать корректно."
    echo "   Добавьте пользователя в группу docker: sudo usermod -aG docker \$USER"
fi

# Определяем режим работы
if [ "$1" = "dev" ]; then
    echo "🔧 Запуск в режиме разработки..."
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
    ENV_MODE="dev"
else
    echo "🏭 Запуск в режиме продакшена..."
    COMPOSE_FILES="-f docker-compose.yml"
    ENV_MODE="prod"
fi

# Запускаем сервисы
echo "🐳 Запуск Docker контейнеров..."
if command -v docker-compose &> /dev/null; then
    docker-compose $COMPOSE_FILES up -d
else
    docker compose $COMPOSE_FILES up -d
fi

# Ждем запуска сервисов
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Проверяем статус сервисов
echo "🔍 Проверка статуса сервисов..."
if command -v docker-compose &> /dev/null; then
    docker-compose $COMPOSE_FILES ps
else
    docker compose $COMPOSE_FILES ps
fi

echo ""
echo "🎉 Система мониторинга успешно настроена!"
echo ""
echo "📊 Доступные сервисы:"
echo "   • Grafana:     http://localhost:3000 (admin/admin)"
echo "   • Prometheus:  http://localhost:9090"
echo "   • Loki:        http://localhost:3100"
echo "   • Promtail:    http://localhost:9080"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Откройте Grafana в браузере: http://localhost:3000"
echo "   2. Добавьте labels к вашим контейнерам для мониторинга:"
echo "      - Для логов: logging=enabled"
echo "      - Для метрик: monitoring=enabled"
echo "   3. Перезапустите ваши приложения с новыми labels"
echo ""
echo "📖 Подробная документация: README.md"
echo "🔧 Интеграция в проект: docs/INTEGRATION.md"
