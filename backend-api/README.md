# Karigar Backend API

Backend API for Karigar - Hyperlocal Services Marketplace built with Go (Gin) and modular architecture.

## Architecture

This backend follows a **modular monolithic architecture** with repository pattern for database abstraction, allowing easy switching between different database implementations.

### Project Structure

```
backend-api/
├── cmd/
│   └── server/          # Application entry point
├── internal/
│   ├── domain/          # Domain models (entities)
│   ├── repository/      # Database abstraction layer (interfaces)
│   ├── service/         # Business logic
│   ├── handler/         # HTTP handlers (Gin)
│   ├── middleware/      # Auth, logging, etc.
│   └── config/          # Configuration
└── pkg/
    ├── database/        # DB connection & migrations
    ├── auth/            # JWT/auth utilities
    └── validator/       # Input validation
```

## Setup

### Prerequisites

- Go 1.21 or higher
- PostgreSQL (or MySQL) database

### Installation

1. Install dependencies:
```bash
go mod tidy
```

2. Set environment variables (create `.env` file):
```env
SERVER_PORT=8080
SERVER_HOST=localhost
ENVIRONMENT=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=karigar
DB_SSLMODE=disable
DB_DRIVER=postgres

JWT_SECRET=your-secret-key-change-in-production
```

3. Run the server:
```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /health` - Check server status

## Database

The repository pattern allows switching between different database implementations. Currently supports:
- PostgreSQL (default)
- MySQL

To switch databases, change the `DB_DRIVER` environment variable and ensure the appropriate driver is imported.

## Development

### Adding New Features

1. Define domain models in `internal/domain/`
2. Create repository interfaces in `internal/repository/interfaces.go`
3. Implement repository in `internal/repository/postgres/` (or `mysql/`)
4. Create service layer in `internal/service/`
5. Create handlers in `internal/handler/`
6. Register routes in `cmd/server/main.go`

