# Инструкция по применению оптимизаций

## 📋 Быстрый старт

Все изменения уже внесены в код. Осталось только применить их на сервере.

### 1. Применить миграцию БД (⚠️ Обязательно)

```bash
cd infrastructure
docker exec guide-postgres psql -U postgres -d chinese_guide -f postgres/migrations/006_optimize_examples_query.sql
```

**Что делает**: Создает оптимизированный индекс для быстрой загрузки примеров.

### 2. Очистить Redis кеш (⚠️ Обязательно)

```bash
cd infrastructure/scripts
./clear-redis-cache.sh
```

**Что делает**: Удаляет старые закешированные данные с неограниченными примерами.

### 3. Перезапустить сервисы (⚠️ Обязательно)

```bash
docker-compose restart dictionary-service api-gateway user-service
```

**Что делает**: Применяет изменения кода.

### 4. Проверить работу

```bash
# Проверить логи
docker-compose logs dictionary-service --tail=50

# Проверить индексы
docker exec guide-postgres psql -U postgres -d chinese_guide -c "\d examples"
```

## ✅ Контрольный список

- [x] Код изменен
- [x] Миграция создана
- [x] Скрипт очистки кеша создан
- [ ] **→ Применить миграцию 006**
- [ ] **→ Очистить Redis кеш**
- [ ] **→ Перезапустить сервисы**
- [ ] Проверить работу на тестовых данных

## 📊 Ожидаемый результат

### Производительность
- Скорость загрузки иероглифа: **100-300 ms** (было 2-5 секунд)
- Потребление памяти: **10-50 MB** (было 500+ MB)

### Стабильность
- Нет зависаний при открытии иероглифов
- Корректная обработка ошибок
- Понятные сообщения об ошибках

## 🔍 Что изменилось

### Backend
- ✅ `dictionary.service.ts` - ограничение до 20 элементов + логирование
- ✅ `dictionary.controller.ts` - обработка ошибок 404
- ✅ Новая миграция `006_optimize_examples_query.sql`
- ✅ Скрипт `clear-redis-cache.sh`

### Frontend (Mobile)
- ✅ `search.tsx` - улучшенная контрастность "слова дня"

### Документация
- ✅ `DATABASE_SCHEMA.md` - полная схема БД
- ✅ `prisma/schema.prisma` - единая Prisma схема
- ✅ `OPTIMIZATION_SUMMARY.md` - сводка по оптимизации
- ✅ `DICTIONARY_OPTIMIZATION_COMPLETE.md` - детальные инструкции

## 🚨 Важные замечания

1. **Миграция безопасна** - создает только индекс, не меняет данные
2. **Очистка кеша** - временно замедлит первые запросы (потом быстро)
3. **Перезапуск** - занимает ~5 секунд
4. **База данных огромная** - 15+ млн примеров, 3.4 млн иероглифов

## 📞 Поддержка

Если что-то пошло не так:

1. Проверьте логи: `docker-compose logs -f dictionary-service`
2. Проверьте индексы: `docker exec guide-postgres psql -U postgres -d chinese_guide -c "\di"`
3. Проверьте Redis: `redis-cli KEYS *` (должно быть пусто после очистки)

## 🔄 Откат изменений (если нужно)

```bash
# Откатить миграцию
docker exec guide-postgres psql -U postgres -d chinese_guide -c "DROP INDEX IF EXISTS idx_examples_character_id_created;"

# Откатить код через git
git checkout HEAD~1 services/dictionary/src/services/dictionary.service.ts
git checkout HEAD~1 services/api-gateway/src/dictionary/dictionary.controller.ts
git checkout HEAD~1 mobile/app/(tabs)/search.tsx

# Перезапустить
docker-compose restart dictionary-service api-gateway
```

---

**Дата**: 2025-10-15  
**Статус**: ✅ Готово к применению  
**Время на применение**: ~2 минуты

