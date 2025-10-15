# Dictionary Service

Микросервис для работы со словарем китайско-русских переводов.

## Возможности

- Парсинг DSL формата BKRS словаря
- Импорт данных в PostgreSQL
- GraphQL API для поиска и получения переводов
- Полнотекстовый поиск с pg_jieba
- Анализ текста на китайском языке
- **Поддержка пиньиня** - извлечение и валидация транскрипции

## Структура

```
src/
├── utils/
│   ├── dsl-parser.ts          # Парсер DSL формата
│   ├── input-detector.ts      # Детектор типа ввода (китайский/пиньинь/русский)
│   ├── text-normalizer.ts     # Нормализация текста
│   └── __tests__/
│       ├── dsl-parser.spec.ts # Тесты парсера
│       ├── input-detector.spec.ts
│       └── text-normalizer.spec.ts
├── scripts/
│   ├── analyze-bkrs.ts        # Скрипт анализа BKRS файлов
│   ├── import-bkrs.ts         # Скрипт импорта данных
│   ├── update-pinyin.ts       # Скрипт обновления пиньиня
│   ├── validate-pinyin.ts     # Скрипт валидации пиньиня
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

### Обновление пиньиня

```bash
npx ts-node src/scripts/update-pinyin.ts
```

Обновляет пиньинь в существующих записях базы данных, используя исправленный парсер DSL.

### Валидация пиньиня

```bash
npx ts-node src/scripts/validate-pinyin.ts
```

Проверяет качество и покрытие пиньиня в базе данных.

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

### Формат пиньиня в BKRS

BKRS словарь использует специальный формат для пиньиня:

```
土康廷斯河
 tǔkāngtīngsī hé
 [m1]река Тукантин ([i]в Бразилии[/i])[/m]
```

- **Заголовок** (headword): китайские иероглифы
- **Пиньинь** (на отдельной строке с отступом): транскрипция
- **Контент** (content): определения с DSL тегами

Парсер автоматически распознает строки с пиньинем и извлекает их с приоритетом над другими форматами.

### Пример использования парсера

```typescript
import { createDslParser } from './utils/dsl-parser';

const parser = createDslParser();

// Парсинг одной записи
const entry = parser.parseEntry('学', '[m1]учиться[/m]');
console.log(entry.simplified);   // "学"
console.log(entry.definitions);  // [{ translation: "учиться", order: 0 }]

// Парсинг с пиньинем на отдельной строке
const entryWithPinyin = parser.parseEntry('土康廷斯河', '[m1]река Тукантин[/m]', 'tǔkāngtīngsī hé');
console.log(entryWithPinyin.pinyin); // "tǔkāngtīngsī hé"

// Парсинг файла (стриминг)
for await (const entry of parser.parseFile('path/to/dict.dsl')) {
  console.log(entry.headword, entry.pinyin, entry.definitions);
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

query SearchByPinyin {
  searchCharacters(query: "xué", limit: 10) {
    id
    simplified
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
      pinyin
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

## Статистика пиньиня

После обновления парсера (2025-01-13):

- **Characters**: 759,272 / 3,420,720 (22.20%) - 96.1% покрытие от ожидаемого
- **Examples**: 23,875 / 15,262,457 (0.16%) - требует дополнительной работы
- **Phrases**: 573 / 245,700 (0.23%) - хорошее покрытие для русско-китайского словаря
- **Общее покрытие**: 783,720 записей с пиньинем (85.6% от ожидаемого)

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
- **Автоматическое распознавание пиньиня** на отдельных строках

Ожидаемая скорость парсинга: ~10,000-50,000 записей/сек (зависит от сложности записей).
Скорость обновления пиньиня: ~1,000-1,500 записей/сек.

