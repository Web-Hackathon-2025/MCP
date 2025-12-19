# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd MCP

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f
```

### Production Deployment

1. **Update Environment Variables**
   - Set strong `JWT_SECRET`
   - Configure production database
   - Set `SERVER_ENVIRONMENT=production`

2. **Build Images**
   ```bash
   docker-compose build --no-cache
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:8080/health
   curl http://localhost:3000
   ```

## Manual Deployment

### Backend

```bash
cd backend-api
go mod download
go build -o server ./cmd/server
./server
```

### Frontend

```bash
cd frontend-web
npm install
npm run build
npm start
```

## Environment Variables

See `.env.example` for all required variables.

## Health Checks

- Backend: `GET /health`
- Frontend: Root URL
- Database: Connection test on startup
- Redis: Ping on startup

## Scaling

To scale services:

```bash
docker-compose up -d --scale backend=3 --scale frontend=2
```

## Monitoring

- Logs: `docker-compose logs -f [service]`
- Stats: `docker stats`
- Health: Check `/health` endpoint

