.PHONY: help build up down restart logs clean test migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

test: ## Run tests
	cd backend-api && go test ./...
	cd frontend-web && npm test

migrate: ## Run database migrations
	cd backend-api && go run cmd/server/main.go migrate

dev-backend: ## Run backend in development mode
	cd backend-api && go run cmd/server/main.go

dev-frontend: ## Run frontend in development mode
	cd frontend-web && npm run dev

install: ## Install all dependencies
	cd backend-api && go mod download
	cd frontend-web && npm install

.PHONY: setup
setup: install ## Initial setup
	@echo "Setting up development environment..."
	cp .env.example .env
	@echo "Please update .env with your configuration"

