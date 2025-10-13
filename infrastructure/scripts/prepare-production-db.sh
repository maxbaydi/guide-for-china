#!/bin/bash
# Скрипт подготовки production базы данных

set -e

echo "🚀 Подготовка production базы данных..."

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Переменные
BACKUP_DIR="backup"
BACKUP_FILE="chinese_guide_full.sql.gz"
DB_NAME="chinese_guide"
DB_USER="postgres"

# Проверка наличия дампа
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Дамп базы данных не найден: $BACKUP_DIR/$BACKUP_FILE${NC}"
    echo ""
    echo "Создайте дамп локальной БД после импорта:"
    echo "  ./infrastructure/scripts/create-db-dump.sh"
    exit 1
fi

echo -e "${BLUE}📦 Найден дамп базы данных: $BACKUP_FILE${NC}"
echo ""

# Размер файла
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo -e "${BLUE}   Размер: $BACKUP_SIZE${NC}"
echo ""

# Подтверждение
read -p "Восстановить базу данных на production? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Восстановление базы данных...${NC}"

# Создание базы данных (если не существует)
docker exec -i guide-postgres psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true

# Применение миграций Prisma
echo -e "${BLUE}📋 Применение Prisma миграций...${NC}"
cd services/dictionary
npx prisma migrate deploy
cd ../..

# Восстановление дампа
echo -e "${BLUE}💾 Восстановление данных из дампа...${NC}"
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | docker exec -i guide-postgres psql -U $DB_USER -d $DB_NAME

# Проверка количества записей
echo ""
echo -e "${BLUE}✅ Проверка данных...${NC}"
CHAR_COUNT=$(docker exec -i guide-postgres psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM characters;")
PHRASE_COUNT=$(docker exec -i guide-postgres psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM phrases;")
EXAMPLE_COUNT=$(docker exec -i guide-postgres psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM examples;")

echo -e "${GREEN}   Иероглифы: $CHAR_COUNT${NC}"
echo -e "${GREEN}   Фразы:     $PHRASE_COUNT${NC}"
echo -e "${GREEN}   Примеры:   $EXAMPLE_COUNT${NC}"

echo ""
echo -e "${GREEN}✅ База данных успешно восстановлена!${NC}"
echo ""
echo "Следующие шаги:"
echo "  1. Запустите Dictionary Service: docker-compose up -d dictionary"
echo "  2. Проверьте GraphQL Playground: http://localhost:4001/graphql"
echo "  3. Протестируйте поиск"

