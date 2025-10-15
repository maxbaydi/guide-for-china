#!/bin/bash
# Скрипт для очистки Redis кеша
# Используется для удаления старых закешированных данных после изменения структуры

echo "🔄 Очистка Redis кеша..."

# Проверяем, установлен ли redis-cli
if ! command -v redis-cli &> /dev/null; then
    echo "❌ redis-cli не установлен. Устанавливаем..."
    sudo apt-get install -y redis-tools
fi

# Подключаемся к Redis (используем localhost по умолчанию)
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

echo "📡 Подключение к Redis на ${REDIS_HOST}:${REDIS_PORT}..."

# Функция для удаления ключей по паттерну
delete_keys() {
    local pattern=$1
    local name=$2
    
    echo "🗑️  Удаление кеша $name ($pattern)..."
    local keys=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT --scan --pattern "$pattern")
    
    if [ -z "$keys" ]; then
        echo "   ℹ️  Ключей не найдено"
        return
    fi
    
    local count=0
    while IFS= read -r key; do
        if [ -n "$key" ]; then
            redis-cli -h $REDIS_HOST -p $REDIS_PORT DEL "$key" > /dev/null
            ((count++))
        fi
    done <<< "$keys"
    
    echo "   ✅ Удалено ключей: $count"
}

# Очищаем кеш иероглифов
delete_keys "character:*" "иероглифов"

# Очищаем кеш результатов поиска
delete_keys "search:*" "поиска"

# Очищаем кеш анализа текста
delete_keys "analysis:*" "анализа"

# Очищаем кеш слова дня
delete_keys "word-of-day:*" "слова дня"

# Очищаем кеш фраз
delete_keys "phrase-search:*" "фраз"

echo ""
echo "✅ Кеш успешно очищен!"

# Показываем статистику
echo ""
echo "📊 Текущая статистика Redis:"
redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO keyspace

