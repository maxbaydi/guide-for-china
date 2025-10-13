# Dictionary Service

Микросервис для работы со словарем китайско-русских переводов.

## Возможности

- Парсинг DSL формата BKRS словаря
- Импорт данных в PostgreSQL
- GraphQL API для поиска и получения переводов
- Полнотекстовый поиск с pg_jieba
- Анализ текста на китайском языке

## Структура

```
src/
├── utils/
│   ├── dsl-parser.ts          # Парсер DSL формата
│   └── __tests__/
│       └── dsl-parser.spec.ts # Тесты парсера
├── scripts/
│   ├── analyze-bkrs.ts        # Скрипт анализа BKRS файлов
│   ├── import-bkrs.ts         # Скрипт импорта данных
│   └── __tests__/
│       └── analyze-bkrs.spec.ts
└── main.ts                     # Точка входа приложения
```

## Установка

```bash
npm install
```

## Использование

### Анализ BKRS файла

```bash
npm run analyze -- ../../db_bkrs/dabkrs_251013/dabkrs_251013
```

Этот скрипт покажет:
- Общее количество записей
- Количество определений и примеров
- Статистику покрытия (пиньинь, традиционные иероглифы)
- Примеры записей

### Импорт данных

```bash
npm run import
```

Импортирует все данные из BKRS файлов в PostgreSQL базу данных.

## Тестирование

```bash
# Запустить все тесты
npm test

# Запустить с coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## DSL Парсер

Парсер поддерживает следующие теги DSL формата:

- `[m1]`, `[m2]` - уровни определений
- `[ex]` - примеры использования
- `[i]` - курсив (часто для части речи)
- `[c]` - контекст
- `[p]` - пометки (устар., перен. и т.д.)
- `[ref]` - ссылки на другие записи
- `[*]` - блок примеров

### Пример использования парсера

```typescript
import { createDslParser } from './utils/dsl-parser';

const parser = createDslParser();

// Парсинг одной записи
const entry = parser.parseEntry('学', '[m1]учиться[/m]');
console.log(entry.simplified);   // "学"
console.log(entry.definitions);  // [{ translation: "учиться", order: 0 }]

// Парсинг файла (стриминг)
for await (const entry of parser.parseFile('path/to/dict.dsl')) {
  console.log(entry.headword, entry.definitions);
}
```

## API

После запуска сервиса GraphQL Playground будет доступен по адресу:
`http://localhost:4001/graphql`

### Основные запросы

```graphql
query SearchCharacters {
  searchCharacters(query: "学", limit: 10) {
    id
    simplified
    traditional
    pinyin
    definitions {
      translation
    }
  }
}

query GetCharacter {
  getCharacter(id: "uuid") {
    simplified
    pinyin
    definitions {
      translation
      partOfSpeech
    }
    examples {
      chinese
      russian
    }
  }
}

query AnalyzeText {
  analyzeText(text: "我在学中文") {
    character
    position
    details {
      simplified
      pinyin
      definitions {
        translation
      }
    }
  }
}
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chinese_guide
DICTIONARY_SERVICE_PORT=4001
```

## Разработка

### Добавление новых функций

1. Создать файл в `src/`
2. Написать тесты в `src/**/__tests__/`
3. Запустить тесты: `npm test`
4. Убедиться, что все тесты проходят

### Code Style

Проект использует ESLint и Prettier для форматирования кода.

```bash
npm run lint
npm run format
```

## Производительность

Парсер DSL оптимизирован для потоковой обработки больших файлов:
- Использует async generators для экономии памяти
- Обрабатывает файлы построчно
- Поддерживает батчинг для импорта в БД

Ожидаемая скорость парсинга: ~10,000-50,000 записей/сек (зависит от сложности записей).

