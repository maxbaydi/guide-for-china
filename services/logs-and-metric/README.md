# 🚀 Система мониторинга Promtail-Prometheus-Loki-Grafana для Guide for China

Универсальная система мониторинга для проекта Guide for China, интегрированная в продакшен окружение для сбора логов и метрик из всех NestJS сервисов.

## 📋 Содержание

- [Быстрый старт](#-быстрый-старт)
- [Архитектура](#-архитектура)
- [Интеграция в проект](#-интеграция-в-проект)
- [Сервисы проекта](#-сервисы-проекта)
- [Примеры использования](#-примеры-использования)
- [Переменные окружения](#-переменные-окружения)
- [Troubleshooting](#-troubleshooting)

## 🚀 Быстрый старт

### 1. Клонирование и настройка

```bash
# Скопируйте папку monitoring в ваш проект
cp -r /path/to/logs-and-metric ./monitoring
cd monitoring

# Запустите автоматическую настройку
./scripts/setup.sh
```

### 2. Добавление мониторинга к контейнерам

Добавьте labels к вашим контейнерам в `docker-compose.yml`:

```yaml
services:
  my-app:
    image: my-app:latest
    labels:
      logging: enabled          # Включить сбор логов
      logging.service: my-app   # Имя сервиса (опционально)
      monitoring: enabled       # Включить сбор метрик (если поддерживается)
      monitoring.port: "8080"   # Порт для метрик (опционально)
```

### 3. Перезапуск приложений

```bash
docker-compose up -d
```

### 4. Проверка работы

```bash
# Тестирование сбора логов
./scripts/test-logs.sh

# Откройте Grafana: http://localhost:3000 (admin/admin)
```

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ваши          │    │   Promtail      │    │   Loki          │
│   контейнеры    │───▶│   (сбор логов)  │───▶│   (хранение)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐              │
│   Prometheus    │    │   Grafana      │◀─────────────┘
│   (метрики)     │───▶│   (визуализация)│
└─────────────────┘    └─────────────────┘
```

### Компоненты

- **Promtail**: Собирает логи из Docker-контейнеров
- **Loki**: Хранит и индексирует логи
- **Prometheus**: Собирает и хранит метрики
- **Grafana**: Визуализирует логи и метрики

## ⚙️ Настройка

### Режимы работы

#### Production (по умолчанию)
```bash
docker-compose up -d
```

#### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Конфигурация через .env

Скопируйте `.env.example` в `.env` и настройте:

```bash
cp .env.example .env
nano .env
```

## 🔗 Интеграция в проект

Система мониторинга полностью интегрирована в продакшен окружение проекта Guide for China через `docker-compose.prod.yml`.

### Запуск в продакшене

```bash
# Запуск всех сервисов включая мониторинг
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса сервисов мониторинга
docker-compose -f docker-compose.prod.yml ps | grep -E "(promtail|loki|prometheus|grafana)"
```

### Доступ к сервисам мониторинга

- **Grafana**: https://mypns.com:3000 (admin/admin123)
- **Prometheus**: http://server-ip:9090
- **Loki**: http://server-ip:3100
- **Promtail**: http://server-ip:9080

**Примечание**: 
- Grafana доступен через домен с HTTPS
- Остальные сервисы доступны через IP сервера (для безопасности, рекомендуется закрыть их через firewall и использовать port-forwarding для локального доступа)
- Для изменения домена отредактируйте переменную `GRAFANA_DOMAIN` в файле `services/logs-and-metric/.env`

## 🏗️ Сервисы проекта

Проект Guide for China включает следующие сервисы с настроенным мониторингом:

### API Gateway (порт 4000)
- **Метрики**: `api_gateway_*`
- **Логи**: `logging.service=api-gateway`
- **Endpoint метрик**: `/metrics`

### Dictionary Service (порт 4001)
- **Метрики**: `dictionary_service_*`
- **Логи**: `logging.service=dictionary-service`
- **Endpoint метрик**: `/metrics`

### User Service (порт 4002)
- **Метрики**: `user_service_*`
- **Логи**: `logging.service=user-service`
- **Endpoint метрик**: `/metrics`

### TTS Service (порт 4003)
- **Метрики**: `tts_service_*`
- **Логи**: `logging.service=tts-service`
- **Endpoint метрик**: `/metrics`

### Инфраструктурные сервисы
- **PostgreSQL**: Логи включены
- **Redis**: Логи включены
- **MinIO**: Логи включены
- **Nginx**: Логи и метрики включены

## 📊 Примеры использования

### NestJS приложения (Guide for China)

Все сервисы проекта уже настроены для мониторинга. Метрики доступны на endpoint `/metrics` каждого сервиса.

#### Просмотр метрик в Prometheus

```bash
# Проверка метрик API Gateway
curl http://localhost:4000/metrics

# Проверка метрик Dictionary Service
curl http://localhost:4001/metrics

# Проверка метрик User Service
curl http://localhost:4002/metrics

# Проверка метрик TTS Service
curl http://localhost:4003/metrics
```

#### Полезные запросы Prometheus

```promql
# Общее количество HTTP запросов по всем сервисам
sum(nestjs_http_requests_total)

# Количество запросов по сервисам
sum by (app_name) (nestjs_http_requests_total)

# Время ответа по сервисам
histogram_quantile(0.95, sum(rate(nestjs_http_request_duration_seconds_bucket[5m])) by (le, app_name))

# Ошибки по сервисам
sum by (app_name) (nestjs_http_requests_total{status_code=~"5.."})

# Активные запросы
sum(nestjs_http_requests_in_progress)
```

#### Полезные запросы Loki (логи)

```logql
# Все логи от API Gateway
{service="api-gateway"}

# Ошибки за последний час
{level="ERROR"} |= "error"

# Логи с определенным текстом
{container_name=~"guide-.*"} |= "database connection"

# Логи по времени и уровню
{service="api-gateway"} | json | level="INFO"

# Логи GraphQL запросов
{service="dictionary-service"} |= "GraphQL"

## 🔧 Переменные окружения

Основные переменные для продакшен окружения (настроены в `.env`):

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `GRAFANA_PORT` | 3000 | Порт Grafana |
| `PROMETHEUS_PORT` | 9090 | Порт Prometheus |
| `LOKI_PORT` | 3100 | Порт Loki |
| `GRAFANA_ADMIN_USER` | admin | Пользователь Grafana |
| `GRAFANA_ADMIN_PASSWORD` | admin123 | Пароль Grafana |
| `LOKI_RETENTION_PERIOD` | 720h | Период хранения логов (30 дней) |
| `PROMETHEUS_RETENTION_TIME` | 30d | Период хранения метрик (30 дней) |
| `ENVIRONMENT` | prod | Режим работы |
| `PROMETHEUS_SCRAPE_INTERVAL` | 15s | Интервал сбора метрик |
| `PROMETHEUS_SCRAPE_TIMEOUT` | 10s | Таймаут для scrape операций |

Полный список в файле `services/logs-and-metric/.env`.

## 🔍 Troubleshooting

### Проблема: Логи не собираются

**Решение:**
1. Проверьте labels контейнеров:
   ```bash
   docker inspect guide-api-gateway | grep -A 10 Labels
   ```

2. Проверьте статус Promtail:
   ```bash
   docker logs guide-promtail
   ```

3. Проверьте доступность Loki:
   ```bash
   curl http://localhost:3100/ready
   ```

### Проблема: Метрики не отображаются в Prometheus

**Решение:**
1. Убедитесь, что сервисы экспортируют метрики:
   ```bash
   curl http://localhost:4000/metrics
   curl http://localhost:4001/metrics
   curl http://localhost:4002/metrics
   curl http://localhost:4003/metrics
   ```

2. Проверьте конфигурацию Prometheus:
   ```bash
   curl http://localhost:9090/api/v1/targets
   ```

3. Проверьте labels `monitoring=enabled` в контейнерах

### Проблема: Grafana не запускается

**Решение:**
1. Проверьте права доступа к папке данных:
   ```bash
   sudo chown -R 472:472 grafana_data/
   ```

2. Проверьте логи Grafana:
   ```bash
   docker logs guide-grafana
   ```

### Проблема: Сервисы не видят друг друга

**Решение:**
1. Убедитесь, что все сервисы в одной сети:
   ```bash
   docker network ls | grep guide-network
   ```

2. Проверьте подключение к сети:
   ```bash
   docker inspect guide-api-gateway | grep NetworkMode
   ```

## 📈 Полезные команды

### Мониторинг состояния системы

```bash
# Статус всех сервисов мониторинга
docker-compose -f docker-compose.prod.yml ps | grep -E "(promtail|loki|prometheus|grafana)"

# Логи сервисов мониторинга
docker logs guide-promtail
docker logs guide-loki
docker logs guide-prometheus
docker logs guide-grafana

# Использование ресурсов
docker stats guide-promtail guide-loki guide-prometheus guide-grafana
```

### Проверка метрик

```bash
# Проверка метрик всех сервисов
for port in 4000 4001 4002 4003; do
  echo "=== Service on port $port ==="
  curl -s http://localhost:$port/metrics | head -10
done
```

### Очистка данных мониторинга

```bash
# Остановка сервисов мониторинга
docker-compose -f docker-compose.prod.yml stop promtail loki prometheus grafana

# Удаление данных (ОСТОРОЖНО!)
docker volume rm guide-for-china_grafana_data guide-for-china_prometheus_data guide-for-china_loki_data

# Перезапуск
docker-compose -f docker-compose.prod.yml up -d promtail loki prometheus grafana
```

## 📚 Дополнительные ресурсы

- [Документация Loki](https://grafana.com/docs/loki/)
- [Документация Prometheus](https://prometheus.io/docs/)
- [Документация Grafana](https://grafana.com/docs/)
- [NestJS Prometheus Integration](https://github.com/willsoto/nestjs-prometheus)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте [Troubleshooting](#-troubleshooting)
2. Изучите логи сервисов: `docker logs <service_name>`
3. Проверьте конфигурацию в `services/logs-and-metric/.env`
4. Убедитесь, что все порты свободны
5. Проверьте, что все сервисы запущены: `docker-compose -f docker-compose.prod.yml ps`

## 📄 Лицензия

MIT License - используйте свободно в ваших проектах.