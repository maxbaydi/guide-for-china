.PHONY: start stop restart clean logs help

# Цвета для вывода
GREEN  := \033[0;32m
BLUE   := \033[0;34m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

help: ## Показать справку по доступным командам
	@echo "$(BLUE)Доступные команды:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

start: ## Запустить все сервисы (pull + up -d)
	@echo "$(BLUE)🚀 Запуск сервисов...$(NC)"
	docker-compose pull
	docker-compose up -d
	@echo "$(GREEN)✅ Сервисы запущены$(NC)"

stop: ## Остановить все сервисы
	@echo "$(YELLOW)⏸️  Остановка сервисов...$(NC)"
	docker-compose stop
	@echo "$(GREEN)✅ Сервисы остановлены$(NC)"

restart: ## Перезапустить все сервисы
	@echo "$(YELLOW)🔄 Перезапуск сервисов...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Сервисы перезапущены$(NC)"

clean: ## Очистить Docker мусор (dangling images, stopped containers, unused networks)
	@echo "$(YELLOW)🧹 Очистка Docker мусора...$(NC)"
	@echo "$(BLUE)Удаление остановленных контейнеров...$(NC)"
	@docker container prune -f
	@echo "$(BLUE)Удаление dangling образов...$(NC)"
	@docker image prune -f
	@echo "$(BLUE)Удаление неиспользуемых сетей...$(NC)"
	@docker network prune -f
	@echo "$(BLUE)Удаление неиспользуемых volumes...$(NC)"
	@docker volume prune -f
	@echo "$(BLUE)Очистка build cache...$(NC)"
	@docker builder prune -f
	@echo "$(GREEN)✅ Очистка завершена$(NC)"

logs: ## Показать логи всех сервисов
	docker-compose logs -f

ps: ## Показать статус контейнеров
	docker-compose ps

down: ## Остановить и удалить все контейнеры
	@echo "$(YELLOW)⚠️  Остановка и удаление контейнеров...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Контейнеры удалены$(NC)"

build: ## Пересобрать образы
	@echo "$(BLUE)🔨 Сборка образов...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Образы собраны$(NC)"

rebuild: ## Полная пересборка и запуск (down + build + start)
	@echo "$(BLUE)🔄 Полная пересборка...$(NC)"
	$(MAKE) down
	$(MAKE) build
	$(MAKE) start
	@echo "$(GREEN)✅ Пересборка завершена$(NC)"

