#!/bin/bash

# =============================================================================
# Скрипт для тестирования сбора логов
# =============================================================================

set -e

echo "🧪 Тестирование сбора логов"
echo "============================"

# Проверяем, запущены ли сервисы мониторинга
if ! docker ps | grep -q "promtail\|loki\|grafana"; then
    echo "❌ Сервисы мониторинга не запущены."
    echo "   Запустите: ./scripts/setup.sh"
    exit 1
fi

echo "✅ Сервисы мониторинга запущены."

# Создаем тестовый контейнер с логами
echo "🐳 Создание тестового контейнера..."

# Останавливаем и удаляем предыдущий тестовый контейнер если есть
docker stop test-logging-container 2>/dev/null || true
docker rm test-logging-container 2>/dev/null || true

# Запускаем тестовый контейнер с label для мониторинга
docker run -d \
    --name test-logging-container \
    --label logging=enabled \
    --label logging.service=test-app \
    --label logging.environment=test \
    alpine:latest \
    sh -c '
        while true; do
            echo "$(date): INFO - Test log message from test container"
            echo "$(date): ERROR - Test error message"
            echo "$(date): DEBUG - Test debug message"
            sleep 2
        done
    '

echo "✅ Тестовый контейнер создан и запущен."

# Ждем накопления логов
echo "⏳ Ожидание накопления логов (10 секунд)..."
sleep 10

# Проверяем логи в Loki
echo "🔍 Проверка логов в Loki..."
LOKI_URL="http://localhost:3100"

# Проверяем доступность Loki
if curl -s "$LOKI_URL/ready" > /dev/null; then
    echo "✅ Loki доступен."
    
    # Получаем список лейблов
    echo "📋 Доступные лейблы в Loki:"
    curl -s "$LOKI_URL/loki/api/v1/labels" | jq -r '.data[]' 2>/dev/null || echo "   (jq не установлен, используйте браузер для проверки)"
    
    # Получаем логи тестового контейнера
    echo ""
    echo "📝 Последние логи тестового контейнера:"
    curl -s "$LOKI_URL/loki/api/v1/query_range" \
        -G \
        -d 'query={container_name="test-logging-container"}' \
        -d 'start='$(date -d '5 minutes ago' -u +%Y-%m-%dT%H:%M:%SZ) \
        -d 'end='$(date -u +%Y-%m-%dT%H:%M:%SZ) \
        -d 'limit=10' | jq -r '.data.result[].values[][1]' 2>/dev/null || echo "   (jq не установлен, используйте Grafana для просмотра логов)"
else
    echo "❌ Loki недоступен по адресу $LOKI_URL"
fi

echo ""
echo "🌐 Проверьте логи в Grafana:"
echo "   1. Откройте http://localhost:3000"
echo "   2. Войдите как admin/admin"
echo "   3. Перейдите в раздел 'Explore'"
echo "   4. Выберите источник данных 'Loki'"
echo "   5. Используйте запрос: {container_name=\"test-logging-container\"}"

echo ""
echo "🧹 Очистка тестового контейнера..."
docker stop test-logging-container
docker rm test-logging-container
echo "✅ Тестовый контейнер удален."

echo ""
echo "🎉 Тестирование завершено!"
echo "   Если логи отображаются в Grafana, система работает корректно."
