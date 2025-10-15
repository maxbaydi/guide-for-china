#!/bin/bash

# Скрипт для применения миграций производительности

set -e

echo "🚀 Применение миграций для оптимизации производительности..."

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка, запущен ли PostgreSQL
log_info "Проверка подключения к PostgreSQL..."
if docker exec guide-postgres pg_isready -U postgres > /dev/null 2>&1; then
    log_success "PostgreSQL доступен"
else
    log_error "PostgreSQL недоступен. Запустите docker-compose up -d postgres"
    exit 1
fi

# Применение миграций для Dictionary БД
log_info "Применение миграций индексов для Dictionary БД..."
if docker exec -i guide-postgres psql -U postgres -d chinese_guide < infrastructure/postgres/migrations/004_add_performance_indexes.sql; then
    log_success "Миграции индексов применены успешно"
else
    log_error "Ошибка при применении миграций индексов"
    exit 1
fi

# Применение миграций для User БД (Prisma)
log_info "Применение миграций Prisma для User БД..."
cd services/user
if npx prisma migrate deploy; then
    log_success "Prisma миграции применены успешно"
else
    log_error "Ошибка при применении Prisma миграций"
    exit 1
fi
cd ../..

# Проверка индексов
log_info "Проверка созданных индексов..."
docker exec guide-postgres psql -U postgres -d chinese_guide -c "\di" | grep -E "idx_characters|idx_definitions|idx_phrases" && \
    log_success "Индексы успешно созданы" || \
    log_warning "Не удалось проверить индексы"

# Обновление статистики планировщика
log_info "Обновление статистики планировщика..."
docker exec guide-postgres psql -U postgres -d chinese_guide -c "ANALYZE;" && \
    log_success "Статистика обновлена"

log_success "🎉 Все миграции применены успешно!"
log_info "Следующие шаги:"
echo "  1. Перезапустить сервисы: docker-compose restart"
echo "  2. Проверить логи: docker-compose logs -f dictionary-service"
echo "  3. Протестировать слово дня в мобильном приложении"

