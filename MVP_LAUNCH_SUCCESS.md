# 🎉 HanGuide MVP - Успешный запуск!

## ✅ Что работает

### 1. API Gateway (http://localhost:4000)

**Эндпоинты аутентификации:**
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/auth/me` - Профиль пользователя
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход

**Эндпоинты словаря:**
- `GET /api/v1/dictionary/search?query={text}&limit={number}` - Поиск иероглифов
- `GET /api/v1/dictionary/character/:id` - Получить иероглиф по ID
- `GET /api/v1/dictionary/analyze?text={text}` - Анализ текста
- `GET /api/v1/dictionary/phrases/search?query={text}&limit={number}` - Поиск фраз

### 2. User Service (http://localhost:4002/graphql)
- JWT аутентификация
- GraphQL API
- Управление пользователями
- Подписки (FREE/PREMIUM)

### 3. Dictionary Service (http://localhost:4001/graphql)
- GraphQL API
- 3.4 млн иероглифов
- Полнотекстовый поиск через pg_jieba
- Определения и примеры

### 4. База данных
- PostgreSQL с расширением pg_jieba
- Автоматическая индексация для поиска
- Triggers для обновления search_vector

### 5. Rate Limiting
- FREE пользователи: 50 запросов/день
- Счетчик сбрасывается каждый день
- Реализовано через Redis

## 🧪 Примеры использования

### Регистрация
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "displayName": "Test User"
  }'
```

### Логин
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

### Поиск иероглифа
```bash
TOKEN="your_jwt_token_here"

curl "http://localhost:4000/api/v1/dictionary/search?query=你好&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### Получение конкретного иероглифа
```bash
curl "http://localhost:4000/api/v1/dictionary/character/{id}" \
  -H "Authorization: Bearer $TOKEN"
```

## 🐳 Управление Docker

### Запуск всех сервисов
```bash
docker-compose up -d
```

### Остановка
```bash
docker-compose stop
```

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api-gateway
docker-compose logs -f user-service
docker-compose logs -f dictionary-service
```

### Проверка статуса
```bash
docker-compose ps
```

### Пересборка после изменений
```bash
docker-compose build {service-name}
docker-compose up -d {service-name}
```

## 📝 Структура проекта

```
hanguide/
├── services/
│   ├── api-gateway/         # REST API Gateway (порт 4000)
│   ├── user-service/        # User Service с GraphQL (порт 4002)
│   └── dictionary/          # Dictionary Service с GraphQL (порт 4001)
├── infrastructure/
│   └── postgres/           # PostgreSQL с pg_jieba
├── docker-compose.yml      # Конфигурация Docker
└── .env                    # Переменные окружения
```

## 🔐 Безопасность

1. **JWT токены:**
   - Access Token: 15 минут
   - Refresh Token: 7 дней

2. **Rate Limiting:**
   - FREE: 50 запросов/день
   - PREMIUM: без ограничений (будущее)

3. **Валидация:**
   - Email валидация
   - Минимальная длина пароля: 8 символов
   - Проверка уникальности email

## 📊 База данных

**Статистика:**
- 3,420,717 иероглифов
- Полнотекстовый индекс через pg_jieba
- Автоматическое обновление search_vector через triggers

**Таблицы:**
- `characters` - иероглифы
- `definitions` - определения
- `examples` - примеры использования
- `phrases` - фразы (русско-китайский словарь)
- `users` - пользователи
- `refresh_tokens` - refresh токены

## 🎯 Что дальше?

### Краткосрочные задачи:
1. ✅ Убрать подробное логирование из production
2. ✅ Добавить обработку ошибок
3. ⏳ Мобильное приложение (React Native)
4. ⏳ Деплой на VPS

### Среднесрочные:
1. Добавить HSK уровни
2. Система избранного
3. История поиска
4. Карточки для запоминания

### Долгосрочные:
1. Premium подписка
2. Оффлайн режим в приложении
3. Система достижений
4. Социальные функции

## 🐛 Известные проблемы

1. **Отсутствие pinyin** - многие иероглифы не имеют pinyin в базе данных BKRS
2. **Предупреждения Docker Compose** - `version` атрибут устарел (не влияет на работу)
3. **Некоторые иероглифы без переводов** - требуется дополнительная обработка данных BKRS

## 📞 Поддержка

Все сервисы работают и готовы к разработке!

**Важные порты:**
- API Gateway: 4000
- Dictionary Service: 4001
- User Service: 4002
- PostgreSQL: 5432
- pgAdmin: 5050
- Redis: 6379

**Health check:**
```bash
curl http://localhost:4000/health
```

---

**Дата запуска:** 14 октября 2025  
**Версия:** MVP 1.0.0  
**Статус:** ✅ Полностью работоспособен

