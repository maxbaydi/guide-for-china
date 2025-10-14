# 📱 Разработка мобильного приложения HanGuide

## Подключение телефона к локальному API

### Текущая конфигурация

- **Локальный IP**: `192.168.31.88`
- **API Gateway**: `http://192.168.31.88:4000`
- **User Service GraphQL**: `http://192.168.31.88:4002/graphql`
- **Dictionary Service**: `http://192.168.31.88:4001`

### ✅ Что уже настроено

1. ✅ Docker контейнеры запущены и слушают на всех интерфейсах (0.0.0.0)
2. ✅ Порты пробрасываются на хост: 4000, 4001, 4002
3. ✅ API доступен по IP: `http://192.168.31.88:4000/health`
4. ✅ Файл `mobile/.env` обновлён с правильным IP адресом

### 🔥 Если API недоступен с телефона

#### Вариант 1: Открыть порты в Windows Firewall (PowerShell с правами администратора)

```powershell
# Запустить PowerShell от имени администратора
cd C:\Users\jerem\OneDrive\Документы\guide-for-china
.\infrastructure\scripts\allow-ports.ps1
```

#### Вариант 2: Открыть порты вручную

1. Откройте **Windows Defender Firewall** → **Advanced Settings**
2. Нажмите **Inbound Rules** → **New Rule**
3. Выберите **Port** → **TCP**
4. Укажите порты: **4000, 4001, 4002**
5. Выберите **Allow the connection**
6. Примените к **Private и Domain** профилям
7. Назовите правило "HanGuide Development"

#### Вариант 3: Временно отключить Firewall для тестирования

```powershell
# ВНИМАНИЕ: Только для тестирования!
netsh advfirewall set allprofiles state off
```

### 📱 Запуск мобильного приложения

#### 1. Убедитесь что Docker контейнеры запущены

```bash
docker-compose up -d
docker ps  # Проверка статуса
```

#### 2. Запустите Expo в режиме туннеля

```bash
cd mobile
npx expo start --tunnel --clear
```

#### 3. Отсканируйте QR код в Expo Go на телефоне

Приложение автоматически подключится к API по адресу `192.168.31.88`.

### 🔍 Проверка доступности API

#### Из WSL/Linux:

```bash
# Проверка портов
./infrastructure/scripts/check-ports.sh

# Ручная проверка
curl http://192.168.31.88:4000/health
```

#### Из браузера телефона:

Откройте в браузере: `http://192.168.31.88:4000/health`

Должны увидеть:
```json
{
  "status": "healthy",
  "uptime": 1234.56,
  "timestamp": "2025-10-14T09:27:13.895Z"
}
```

### 🌐 Проверка из браузера компьютера

- API Health: http://192.168.31.88:4000/health
- GraphQL Playground: http://192.168.31.88:4002/graphql
- Dictionary API: http://192.168.31.88:4001/search?q=你好

### ⚠️ Важно

1. **Телефон и компьютер должны быть в одной WiFi сети**
2. **Если IP компьютера изменится**, обновите `mobile/.env`:
   ```bash
   # Узнать новый IP
   cmd.exe /c "ipconfig | findstr IPv4"
   
   # Обновить mobile/.env
   API_BASE_URL=http://НОВЫЙ_IP:4000/api/v1
   GRAPHQL_URL=http://НОВЫЙ_IP:4002/graphql
   ```

3. **Перезапустите Expo** после изменения `.env`:
   ```bash
   cd mobile
   npx expo start --clear
   ```

### 🐛 Troubleshooting

#### Проблема: "Network Error" на телефоне

**Решение:**
1. Проверьте, что API доступен из браузера телефона
2. Проверьте Windows Firewall
3. Убедитесь, что Docker контейнеры запущены
4. Попробуйте перезапустить Docker Desktop

#### Проблема: IP адрес изменился

**Решение:**
```bash
# Узнать текущий IP
cmd.exe /c "ipconfig | findstr IPv4"

# Обновить конфигурацию
# Отредактируйте mobile/.env с новым IP
```

#### Проблема: Порты заняты

**Решение:**
```bash
# Найти процессы на портах
netstat -ano | findstr :4000
netstat -ano | findstr :4001
netstat -ano | findstr :4002

# Остановить Docker
docker-compose down

# Запустить заново
docker-compose up -d
```

### 📝 Полезные команды

```bash
# Проверить статус контейнеров
docker-compose ps

# Посмотреть логи
docker-compose logs -f api-gateway
docker-compose logs -f user-service

# Перезапустить конкретный сервис
docker-compose restart api-gateway

# Остановить всё
docker-compose down

# Запустить с пересборкой
docker-compose up -d --build
```

### 🎯 Текущий статус

- ✅ Docker контейнеры запущены
- ✅ API доступен по IP 192.168.31.88
- ✅ Mobile .env настроен
- ⚠️ Возможно нужно открыть порты в Firewall

**Следующий шаг:** Попробуйте открыть в браузере телефона `http://192.168.31.88:4000/health`

- Если открывается → всё работает! 🎉
- Если не открывается → нужно настроить Firewall (см. выше)

