# Dictionary Service - GraphQL API

## 🚀 Запуск сервера

```bash
cd services/dictionary
npm run start:dev  # Development режим с hot reload
npm run start      # Production режим
```

Сервер запуст ится на `http://localhost:3001`  
GraphQL Playground: `http://localhost:3001/graphql`

## 📊 Доступные Query

### 1. `searchCharacters` - Поиск иероглифов

Полнотекстовый поиск с использованием pg_jieba.

```graphql
query SearchCharacters {
  searchCharacters(query: "学", limit: 5) {
    id
    simplified
    traditional
    pinyin
    definitions {
      id
      translation
      order
    }
    examples {
      id
      chinese
      pinyin
      russian
    }
  }
}
```

**Параметры:**
- `query: String!` - Поисковый запрос (китайские иероглифы или пиньинь)
- `limit: Int` - Количество результатов (по умолчанию: 20)

**Возвращает:** Массив объектов `Character`

---

### 2. `getCharacter` - Получить иероглиф по ID

```graphql
query GetCharacter {
  getCharacter(id: "a43c7953-2f80-46c4-a8dd-d011dbabffc1") {
    id
    simplified
    traditional
    pinyin
    hskLevel
    frequency
    definitions {
      translation
      order
    }
    examples {
      chinese
      pinyin
      russian
      source
    }
    createdAt
  }
}
```

**Параметры:**
- `id: String!` - UUID иероглифа

**Возвращает:** Объект `Character` или `null`

---

### 3. `getCharacterBySimplified` - Получить иероглиф по упрощенному написанию

```graphql
query GetCharacterBySimplified {
  getCharacterBySimplified(simplified: "学") {
    id
    simplified
    traditional
    pinyin
    definitions {
      translation
    }
  }
}
```

**Параметры:**
- `simplified: String!` - Упрощенный иероглиф

**Возвращает:** Объект `Character` или `null`

---

### 4. `searchPhrases` - Поиск фраз

Поиск по русскому или китайскому тексту.

```graphql
query SearchPhrases {
  searchPhrases(query: "учиться", limit: 10) {
    id
    russian
    chinese
    pinyin
    context
    createdAt
  }
}
```

**Параметры:**
- `query: String!` - Поисковый запрос (русский или китайский)
- `limit: Int` - Количество результатов (по умолчанию: 20)

**Возвращает:** Массив объектов `Phrase`

---

### 5. `analyzeText` - Анализ текста

Разбивает текст на иероглифы и возвращает информацию о каждом.

```graphql
query AnalyzeText {
  analyzeText(text: "我学习中文") {
    character
    position
    details {
      id
      simplified
      pinyin
      definitions {
        translation
      }
    }
  }
}
```

**Параметры:**
- `text: String!` - Текст для анализа

**Возвращает:** Массив объектов `CharacterAnalysis`

---

## 📝 Типы данных

### Character

```graphql
type Character {
  id: ID!
  simplified: String!
  traditional: String
  pinyin: String
  hskLevel: Int
  frequency: Int
  definitions: [Definition!]!
  examples: [Example!]!
  createdAt: Date!
}
```

### Definition

```graphql
type Definition {
  id: ID!
  characterId: String!
  translation: String!
  order: Int!
}
```

### Example

```graphql
type Example {
  id: ID!
  characterId: String!
  chinese: String!
  pinyin: String
  russian: String!
  source: String
}
```

### Phrase

```graphql
type Phrase {
  id: ID!
  russian: String!
  chinese: String!
  pinyin: String
  context: String
  createdAt: Date!
}
```

### CharacterAnalysis

```graphql
type CharacterAnalysis {
  character: String!
  details: Character
  position: Int!
}
```

---

## 🧪 Примеры использования

### Пример 1: Поиск и детали

```graphql
{
  searchCharacters(query: "学", limit: 3) {
    simplified
    pinyin
    definitions {
      translation
    }
  }
}
```

**Результат:**

```json
{
  "data": {
    "searchCharacters": [
      {
        "simplified": "学",
        "pinyin": "xué",
        "definitions": [
          {
            "translation": "I гл."
          },
          {
            "translation": "1) учиться; обучаться, заниматься; изучать"
          }
        ]
      }
    ]
  }
}
```

### Пример 2: Анализ предложения

```graphql
{
  analyzeText(text: "我学中文") {
    character
    position
    details {
      pinyin
      definitions {
        translation
      }
    }
  }
}
```

**Результат:**

```json
{
  "data": {
    "analyzeText": [
      {
        "character": "我",
        "position": 0,
        "details": {
          "pinyin": "wǒ",
          "definitions": [
            { "translation": "я" }
          ]
        }
      },
      {
        "character": "学",
        "position": 1,
        "details": {
          "pinyin": "xué",
          "definitions": [
            { "translation": "учиться" }
          ]
        }
      }
    ]
  }
}
```

---

## 🔍 Полнотекстовый поиск

Dictionary Service использует **pg_jieba** для полнотекстового поиска по китайским иероглифам.

**Возможности:**
- Поиск по упрощенным иероглифам
- Поиск по пиньиню
- Ранжирование результатов по релевантности
- Поддержка сложных запросов с несколькими иероглифами

**Примеры поисковых запросов:**
- `学` - найдет все слова с иероглифом "学"
- `xue` - найдет слова с пиньинем "xue"
- `学习` - найдет фразы со словом "学习"

---

## 📊 Статистика базы данных

После импорта BKRS в базе данных:

- **Иероглифы:** 3,420,720
- **Определения:** 3,600,009
- **Фразы:** 245,702
- **Примеры:** 653

---

## ⚙️ Конфигурация

Переменные окружения в `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chinese_guide
PORT=3001
CORS_ORIGIN=*
```

---

## 🧪 Тестирование

Запуск тестов:

```bash
npm test                                    # Все тесты
npm test -- dictionary.service.spec.ts      # Конкретный тест
npm test:watch                              # Watch режим
npm test:cov                                # С покрытием
```

**Статус тестов:** ✅ 58/58 passing

---

## 📚 Дополнительная информация

- Все query поддерживают GraphQL introspection
- GraphQL Playground доступен в dev режиме
- API автоматически генерирует schema в `src/schema.gql`
- Поддержка CORS для мобильного приложения включена

---

## 🚀 Следующие шаги

1. ✅ Dictionary Service завершен
2. ⏳ API Gateway - объединение сервисов
3. ⏳ User Service - аутентификация
4. ⏳ Subscription Service - монетизация

