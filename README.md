# Karigar - Hyperlocal Services Marketplace

A modern, scalable platform connecting customers with local service providers built with Next.js, Go, PostgreSQL, and Redis.

## 🏗️ Architecture

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS
- **Backend**: Go (Gin framework) with clean architecture
- **Database**: PostgreSQL (Supabase compatible)
- **Cache**: Redis
- **Deployment**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.21+ (for local development)
- Node.js 20+ (for local development)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd MCP

# Copy environment file
cp .env.example .env

# Edit .env with your configuration

# Start all services
make up
# or
docker-compose up -d

# View logs
make logs
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Local Development

```bash
# Install dependencies
make install

# Setup environment
make setup

# Run backend (terminal 1)
make dev-backend

# Run frontend (terminal 2)
make dev-frontend
```

## 📁 Project Structure

```
.
├── backend-api/          # Go backend service
│   ├── cmd/             # Application entry points
│   ├── internal/        # Private application code
│   │   ├── auth/        # Authentication service
│   │   ├── config/      # Configuration
│   │   ├── domain/      # Domain models
│   │   ├── repository/  # Data access layer
│   │   └── service/     # Business logic
│   └── pkg/             # Public packages
│       ├── auth/        # Auth utilities
│       ├── database/    # Database connection & migrations
│       └── redis/       # Redis client
├── frontend-web/        # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── lib/            # Utilities & API client
└── docker-compose.yml  # Docker orchestration
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

- Database credentials
- Redis connection
- JWT secret key
- API URLs

## 🧪 Testing

```bash
# Run backend tests
cd backend-api && go test ./...

# Run frontend tests
cd frontend-web && npm test
```

## 📦 Building for Production

```bash
# Build Docker images
make build

# Or build individually
docker build -t karigar-backend ./backend-api
docker build -t karigar-frontend ./frontend-web
```

## 🗄️ Database Migrations

Migrations run automatically on server startup. To run manually:

```bash
# Using Docker
docker-compose exec backend ./server migrate

# Local development
cd backend-api && go run cmd/server/main.go migrate
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment-based secrets
- SQL injection prevention (parameterized queries)

## 📝 API Documentation

API endpoints are available at `/api/v1/`:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

[Your License Here]

## 👥 Team

Built for the hackathon project.
