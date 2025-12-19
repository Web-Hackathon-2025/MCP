# Deployment & Infrastructure Documentation

## Table of Contents
1. [Overview](#overview)
2. [Infrastructure Components](#infrastructure-components)
3. [Docker Configuration](#docker-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Strategies](#deployment-strategies)
6. [Scaling & Performance](#scaling--performance)
7. [Monitoring & Logging](#monitoring--logging)
8. [Disaster Recovery](#disaster-recovery)

---

## Overview

Karigar is designed for deployment using **Docker** and **Docker Compose** for development and production environments. The infrastructure supports horizontal scaling and high availability.

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer / Gateway          │
└─────────────────────────────────────────┘
           │              │
           ▼              ▼
    ┌──────────┐    ┌──────────┐
    │ Frontend │    │ Backend  │
    │ (Next.js)│    │  (Go)    │
    └──────────┘    └──────────┘
           │              │
           └──────┬───────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   ┌─────────┐        ┌─────────┐
   │PostgreSQL│       │  Redis  │
   └─────────┘        └─────────┘
```

---

## Infrastructure Components

### 1. Frontend Service

**Container:** `karigar-frontend`  
**Image:** Custom Next.js build  
**Port:** 3000  
**Technology:** Next.js 16, Node.js 20

**Configuration:**
- Standalone output mode
- Production optimizations
- Static asset optimization
- Server-side rendering

**Resource Requirements:**
- **Development:** 512MB RAM, 0.5 CPU
- **Production:** 1GB RAM, 1 CPU (per instance)

**Health Check:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

### 2. Backend API Service

**Container:** `karigar-backend`  
**Image:** Go binary  
**Port:** 8080  
**Technology:** Go 1.21+, Gin Framework

**Configuration:**
- Stateless API server
- Connection pooling
- Graceful shutdown
- Health endpoints

**Resource Requirements:**
- **Development:** 512MB RAM, 0.5 CPU
- **Production:** 2GB RAM, 2 CPU (per instance)

**Health Check:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Dependencies:**
- PostgreSQL (must be healthy)
- Redis (must be healthy)

---

### 3. PostgreSQL Database

**Container:** `karigar-postgres`  
**Image:** postgres:15-alpine  
**Port:** 5432  
**Version:** PostgreSQL 15

**Configuration:**
- Persistent volume storage
- Connection pooling
- Automatic migrations
- Backup enabled

**Resource Requirements:**
- **Development:** 1GB RAM, 1 CPU
- **Production:** 4GB RAM, 2 CPU

**Volume:**
- `postgres_data` - Persistent data storage

**Environment Variables:**
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<secure_password>
POSTGRES_DB=karigar
```

**Health Check:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

### 4. Redis Cache

**Container:** `karigar-redis`  
**Image:** redis:7-alpine  
**Port:** 6379  
**Version:** Redis 7

**Configuration:**
- Append-only file (AOF) persistence
- Password protection
- Memory limits
- Eviction policies

**Resource Requirements:**
- **Development:** 256MB RAM, 0.25 CPU
- **Production:** 1GB RAM, 0.5 CPU

**Volume:**
- `redis_data` - Persistent cache storage

**Configuration:**
```redis
appendonly yes
requirepass <password>
maxmemory 512mb
maxmemory-policy allkeys-lru
```

**Health Check:**
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 10s
  timeout: 3s
  retries: 5
```

---

## Docker Configuration

### Docker Compose Structure

```yaml
version: '3.8'

services:
  postgres:    # Database
  redis:       # Cache
  backend:     # API Server
  frontend:    # Web Application

volumes:
  postgres_data:
  redis_data:

networks:
  karigar-network:
```

### Network Configuration

**Network Type:** Bridge  
**Network Name:** `karigar-network`  
**Isolation:** Internal Docker network

**Service Communication:**
- Services communicate via service names
- Internal DNS resolution
- No external exposure required

### Volume Management

**PostgreSQL Volume:**
- Type: Local
- Path: `/var/lib/postgresql/data`
- Backup: Daily snapshots

**Redis Volume:**
- Type: Local
- Path: `/data`
- Persistence: AOF enabled

---

## Environment Configuration

### Environment Variables

#### Backend Environment Variables

```env
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
SERVER_ENVIRONMENT=production

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<secure_password>
DB_NAME=karigar
DB_SSLMODE=disable
DB_DRIVER=postgres

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<secure_password>
REDIS_DB=0

# JWT Configuration
JWT_SECRET=<32+_character_secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Supabase (if using)
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
```

#### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NODE_ENV=production
```

### Environment Files

- `.env.example` - Template with all variables
- `.env.local` - Local development (gitignored)
- `.env.production` - Production configuration (secure)

---

## Deployment Strategies

### Development Deployment

**Using Docker Compose:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Local Development:**
```bash
# Backend
cd backend-api
go run cmd/server/main.go

# Frontend
cd frontend-web
npm run dev
```

---

### Production Deployment

#### Option 1: Docker Compose (Single Server)

**Steps:**
1. Clone repository
2. Copy `.env.example` to `.env`
3. Configure environment variables
4. Build images: `docker-compose build`
5. Start services: `docker-compose up -d`
6. Verify health: `curl http://localhost:8080/health`

**Scaling:**
```bash
docker-compose up -d --scale backend=3 --scale frontend=2
```

---

#### Option 2: Kubernetes (Multi-Server)

**Deployment Files:**
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/postgres-statefulset.yaml`
- `k8s/redis-statefulset.yaml`
- `k8s/services.yaml`
- `k8s/ingress.yaml`

**Scaling:**
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

---

#### Option 3: Cloud Platforms

**AWS:**
- ECS/EKS for containers
- RDS for PostgreSQL
- ElastiCache for Redis
- CloudFront for CDN
- ALB for load balancing

**Google Cloud:**
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud CDN
- Load Balancer

**Azure:**
- Container Instances/AKS
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure CDN
- Application Gateway

---

## Scaling & Performance

### Horizontal Scaling

**Frontend:**
- Stateless application
- Scale behind load balancer
- CDN for static assets
- Edge caching

**Backend:**
- Stateless API servers
- Shared database connection pool
- Redis for shared state
- Load balancer distribution

**Scaling Factors:**
- CPU usage > 70%
- Memory usage > 80%
- Response time > 500ms
- Request queue depth

### Vertical Scaling

**Database:**
- Increase CPU/RAM
- Optimize queries
- Add read replicas
- Connection pool tuning

**Application:**
- Increase container resources
- Optimize code
- Enable caching
- Database query optimization

### Performance Optimization

**Database:**
- Connection pooling (max 25 connections)
- Query optimization
- Index optimization
- Read replicas for read-heavy workloads

**Cache Strategy:**
- User session caching
- Frequently accessed data
- Query result caching
- Rate limit counters

**CDN:**
- Static asset caching
- Image optimization
- Global distribution
- Edge caching

---

## Monitoring & Logging

### Application Logging

**Log Levels:**
- `DEBUG` - Detailed debugging information
- `INFO` - General information
- `WARN` - Warning messages
- `ERROR` - Error conditions
- `FATAL` - Critical errors

**Log Format:**
```json
{
  "timestamp": "2025-12-19T10:00:00Z",
  "level": "INFO",
  "service": "backend",
  "message": "User registered successfully",
  "user_id": "uuid",
  "request_id": "uuid"
}
```

**Log Storage:**
- Container logs (stdout/stderr)
- Centralized logging (future: ELK, Loki)
- Log rotation
- Retention: 30 days

---

### Health Monitoring

**Health Endpoints:**
- `/health` - Basic health check
- `/health/detailed` - Detailed system status

**Metrics (Future):**
- Request rate
- Response times
- Error rates
- Database connection pool
- Cache hit rates
- CPU/Memory usage

**Alerting (Future):**
- High error rates
- Slow response times
- Database connection failures
- Disk space warnings
- Memory pressure

---

### Infrastructure Monitoring

**Container Health:**
- Docker health checks
- Container restart policies
- Resource limits
- OOM (Out of Memory) handling

**Database Monitoring:**
- Connection count
- Query performance
- Replication lag (if applicable)
- Disk usage
- Backup status

**Cache Monitoring:**
- Memory usage
- Hit/miss rates
- Eviction rates
- Connection count

---

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- **Frequency:** Daily automated backups
- **Retention:** 30 days
- **Type:** Full + Incremental
- **Storage:** Off-site backup storage
- **Testing:** Monthly restore tests

**Redis Backups:**
- **Frequency:** Every 6 hours
- **Type:** AOF persistence
- **Retention:** 7 days

**Application Backups:**
- **Code:** Git repository
- **Configuration:** Version controlled
- **Secrets:** Secure secret management

---

### Recovery Procedures

#### Database Recovery

1. **Stop application services**
2. **Restore database from backup**
3. **Verify data integrity**
4. **Run migrations if needed**
5. **Restart services**
6. **Verify application functionality**

#### Complete System Recovery

1. **Provision new infrastructure**
2. **Restore database**
3. **Deploy application code**
4. **Restore Redis data**
5. **Update DNS/load balancer**
6. **Verify all services**
7. **Monitor for issues**

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours

---

### High Availability

**Strategies:**
- Multiple backend instances
- Database replication (future)
- Redis cluster (future)
- Load balancer with health checks
- Automatic failover

**Failover Process:**
1. Health check detects failure
2. Remove failed instance from pool
3. Route traffic to healthy instances
4. Alert operations team
5. Investigate and resolve issue
6. Re-add instance to pool

---

## Security

### Container Security

- Non-root user execution
- Minimal base images (Alpine)
- Security scanning
- Regular image updates
- Secrets management

### Network Security

- Internal Docker network
- Firewall rules
- TLS/HTTPS encryption
- VPN for admin access
- DDoS protection

### Data Security

- Encrypted database connections
- Encrypted backups
- Secure secret storage
- Access control
- Audit logging

---

## CI/CD Pipeline (Future)

### Continuous Integration

**Triggers:**
- Push to main branch
- Pull request creation
- Manual trigger

**Steps:**
1. Run tests
2. Build Docker images
3. Security scanning
4. Push to registry

### Continuous Deployment

**Staging:**
- Auto-deploy on merge to develop
- Integration tests
- Performance tests

**Production:**
- Manual approval required
- Blue-green deployment
- Rollback capability
- Health checks

---

## Resource Requirements

### Minimum Requirements (Development)

| Service | CPU | RAM | Disk |
|---------|-----|-----|------|
| Frontend | 0.5 | 512MB | 1GB |
| Backend | 0.5 | 512MB | 500MB |
| PostgreSQL | 1 | 1GB | 10GB |
| Redis | 0.25 | 256MB | 1GB |
| **Total** | **2.25** | **2.25GB** | **12.5GB** |

### Recommended Requirements (Production)

| Service | CPU | RAM | Disk |
|---------|-----|-----|------|
| Frontend (per instance) | 1 | 1GB | 2GB |
| Backend (per instance) | 2 | 2GB | 1GB |
| PostgreSQL | 4 | 8GB | 100GB |
| Redis | 1 | 2GB | 5GB |
| **Total (2 instances each)** | **10** | **16GB** | **110GB** |

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Secrets securely stored
- [ ] Database migrations tested
- [ ] Health checks verified
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Security scanning completed

### Deployment

- [ ] Build Docker images
- [ ] Push to registry
- [ ] Deploy infrastructure
- [ ] Run migrations
- [ ] Verify health checks
- [ ] Test critical paths
- [ ] Monitor for errors

### Post-Deployment

- [ ] Verify all services running
- [ ] Check application logs
- [ ] Monitor performance metrics
- [ ] Test user flows
- [ ] Verify backups running
- [ ] Update documentation

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Maintained By:** DevOps Team

