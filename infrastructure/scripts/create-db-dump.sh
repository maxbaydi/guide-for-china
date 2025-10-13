#!/bin/bash
# Скрипт создания дампа базы данных после импорта

set -e

echo "💾 Создание дампа базы данных..."

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Переменные
BACKUP_DIR="backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="chinese_guide_$TIMESTAMP.sql.gz"
DB_NAME="chinese_guide"
DB_USER="postgres"

# Создание директории backup
mkdir -p $BACKUP_DIR

echo -e "${BLUE}📊 Статистика базы данных:${NC}"
echo ""

# Показать статистику
docker exec -i guide-postgres psql -U $DB_USER -d $DB_NAME << EOF
SELECT 
  'Иероглифы' as table_name, 
  COUNT(*) as count 
FROM characters
UNION ALL
SELECT 
  'Определения', 
  COUNT(*) 
FROM definitions
UNION ALL
SELECT 
  'Примеры', 
  COUNT(*) 
FROM examples
UNION ALL
SELECT 
  'Фразы', 
  COUNT(*) 
FROM phrases;
EOF

echo ""
echo -e "${BLUE}🗜️  Создание сжатого дампа...${NC}"

# Создание дампа с прогрессом
docker exec -t guide-postgres pg_dump -U $DB_USER -d $DB_NAME | \
  pv -pterb | \
  gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Если pv не установлен, используем обычный способ
if [ $? -ne 0 ]; then
    echo "Используем стандартный метод (без прогресс-бара)..."
    docker exec -t guide-postgres pg_dump -U $DB_USER -d $DB_NAME | \
      gzip > "$BACKUP_DIR/$BACKUP_FILE"
fi

# Создать симлинк на latest
ln -sf "$BACKUP_FILE" "$BACKUP_DIR/chinese_guide_full.sql.gz"

# Размер файла
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)

echo ""
echo -e "${GREEN}✅ Дамп создан успешно!${NC}"
echo ""
echo -e "${BLUE}📁 Файл:   $BACKUP_DIR/$BACKUP_FILE${NC}"
echo -e "${BLUE}📦 Размер: $BACKUP_SIZE${NC}"
echo ""
echo "Этот файл можно использовать для:"
echo "  - Восстановления на production"
echo "  - Создания копии для другого разработчика"
echo "  - Резервного копирования"
echo ""
echo "Для восстановления используйте:"
echo "  ./infrastructure/scripts/prepare-production-db.sh"

