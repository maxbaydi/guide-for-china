#!/bin/bash

# Скрипт для восстановления схемы базы данных Chinese Guide
# Использует schema_dump.sql для создания полной схемы на новом сервере

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Проверка параметров
if [ $# -lt 3 ]; then
    echo "Использование: $0 <HOST> <PORT> <DATABASE_NAME> [USERNAME] [PASSWORD]"
    echo ""
    echo "Примеры:"
    echo "  $0 localhost 5432 chinese_guide postgres postgres"
    echo "  $0 db.example.com 5432 chinese_guide myuser mypass"
    echo ""
    exit 1
fi

HOST=$1
PORT=$2
DATABASE=$3
USERNAME=${4:-postgres}
PASSWORD=${5:-postgres}

SCHEMA_FILE="$(dirname "$0")/schema_dump.sql"

log "Восстановление схемы базы данных Chinese Guide"
log "Хост: $HOST:$PORT"
log "База данных: $DATABASE"
log "Пользователь: $USERNAME"
log "Файл схемы: $SCHEMA_FILE"

# Проверка существования файла схемы
if [ ! -f "$SCHEMA_FILE" ]; then
    error "Файл схемы не найден: $SCHEMA_FILE"
fi

# Проверка подключения к PostgreSQL
log "Проверка подключения к PostgreSQL..."
if ! PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    error "Не удается подключиться к PostgreSQL серверу"
fi

# Проверка версии PostgreSQL
log "Проверка версии PostgreSQL..."
VERSION=$(PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d postgres -t -c "SELECT version();" | grep -o 'PostgreSQL [0-9]\+' | grep -o '[0-9]\+')
if [ "$VERSION" -lt 14 ]; then
    warning "Рекомендуется PostgreSQL версии 14 или выше. Текущая версия: $VERSION"
fi

# Проверка существования базы данных
log "Проверка существования базы данных '$DATABASE'..."
if PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -c "SELECT 1;" > /dev/null 2>&1; then
    warning "База данных '$DATABASE' уже существует"
    read -p "Продолжить восстановление? Это перезапишет существующую схему! (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Операция отменена"
        exit 0
    fi
else
    log "Создание базы данных '$DATABASE'..."
    PGPASSWORD="$PASSWORD" createdb -h "$HOST" -p "$PORT" -U "$USERNAME" "$DATABASE"
    success "База данных '$DATABASE' создана"
fi

# Проверка необходимых расширений
log "Проверка доступности расширений PostgreSQL..."

# Проверка pg_jieba (критически важно для китайского поиска)
if ! PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -c "CREATE EXTENSION IF NOT EXISTS pg_jieba;" > /dev/null 2>&1; then
    error "Расширение pg_jieba недоступно. Установите его для корректной работы китайского поиска."
fi

# Проверка других расширений
for ext in pg_trgm unaccent uuid-ossp; do
    if ! PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -c "CREATE EXTENSION IF NOT EXISTS $ext;" > /dev/null 2>&1; then
        warning "Расширение $ext недоступно"
    fi
done

success "Все необходимые расширения установлены"

# Восстановление схемы
log "Восстановление схемы из файла..."
if PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -f "$SCHEMA_FILE" -v ON_ERROR_STOP=1; then
    success "Схема успешно восстановлена"
else
    error "Ошибка при восстановлении схемы"
fi

# Проверка целостности
log "Проверка целостности схемы..."

# Проверка таблиц
TABLES=$(PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
log "Создано таблиц: $TABLES"

# Проверка функций
FUNCTIONS=$(PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -t -c "SELECT count(*) FROM pg_proc WHERE proname LIKE 'search_%' OR proname LIKE 'normalize_%';")
log "Создано функций поиска: $FUNCTIONS"

# Проверка индексов
INDEXES=$(PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -t -c "SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';")
log "Создано индексов: $INDEXES"

# Проверка расширений
EXTENSIONS=$(PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -t -c "SELECT count(*) FROM pg_extension WHERE extname IN ('pg_jieba', 'pg_trgm', 'unaccent', 'uuid-ossp');")
log "Установлено расширений: $EXTENSIONS"

# Финальная проверка
log "Выполнение финальной проверки..."
if PGPASSWORD="$PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -c "SELECT 'Schema restored successfully' as status;" > /dev/null 2>&1; then
    success "Схема базы данных Chinese Guide успешно восстановлена!"
    echo ""
    log "Следующие шаги:"
    log "1. Настройте переменные окружения для вашего приложения"
    log "2. Обновите DATABASE_URL в конфигурации сервисов"
    log "3. Запустите приложение и проверьте подключение"
    echo ""
    log "Пример DATABASE_URL:"
    log "postgresql://$USERNAME:$PASSWORD@$HOST:$PORT/$DATABASE"
else
    error "Ошибка при финальной проверке"
fi


