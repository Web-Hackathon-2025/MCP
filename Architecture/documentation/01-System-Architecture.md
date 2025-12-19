# System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [System Components](#system-components)
4. [Technology Stack](#technology-stack)
5. [Data Flow](#data-flow)
6. [Scalability Considerations](#scalability-considerations)
7. [High Availability](#high-availability)

---

## Overview

Karigar is a **hyperlocal services marketplace** built using a **modular monolithic architecture**. The platform connects customers with local service providers, enabling seamless service discovery, booking, and management.

### Key Characteristics
- **Modular Monolithic**: Single deployable unit with clear module boundaries
- **Microservice-Ready**: Architecture allows future migration to microservices
- **Scalable**: Designed to handle millions of users
- **Production-Grade**: Enterprise-level patterns and practices

---

## Architecture Pattern

### Modular Monolithic Architecture

The application follows a **modular monolithic** pattern, which provides:

**Advantages:**
- ✅ Single deployment unit (simpler DevOps)
- ✅ Shared database (strong consistency)
- ✅ Clear module boundaries (maintainability)
- ✅ Easy to refactor into microservices later
- ✅ Lower operational complexity

**Module Structure:**
```
backend-api/
├── internal/
│   ├── auth/          # Authentication Module
│   ├── customers/     # Customer Management Module
│   ├── providers/     # Service Provider Module
│   ├── services/     # Services Management Module
│   ├── requests/     # Service Requests Module
│   └── reviews/       # Reviews & Ratings Module
```

Each module contains:
- Domain models
- Repository interfaces
- Service layer (business logic)
- HTTP handlers
- DTOs (Data Transfer Objects)

---

## System Components

### 1. Frontend Layer

**Technology:** Next.js 16, React 19, TypeScript, Tailwind CSS

**Responsibilities:**
- User interface rendering
- Client-side routing
- State management
- API communication
- Authentication UI flows
- Responsive design

**Key Features:**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- Client-Side Navigation
- Code splitting
- Image optimization

**Deployment:**
- CDN distribution
- Edge caching
- Static asset optimization

---

### 2. Backend API Layer

**Technology:** Go 1.21+, Gin Framework

**Architecture Pattern:** Clean Architecture / Layered Architecture

```
┌─────────────────────────────────────┐
│         HTTP Handlers               │  ← API Layer
├─────────────────────────────────────┤
│         Service Layer               │  ← Business Logic
├─────────────────────────────────────┤
│         Repository Layer             │  ← Data Access
├─────────────────────────────────────┤
│         Domain Models                │  ← Core Entities
└─────────────────────────────────────┘
```

**Responsibilities:**
- RESTful API endpoints
- Request validation
- Authentication & Authorization
- Business logic execution
- Data transformation
- Error handling

**Key Features:**
- JWT-based authentication
- Role-based access control (RBAC)
- Request validation
- Error handling middleware
- CORS configuration
- Rate limiting (via Redis)

---

### 3. Database Layer

**Technology:** PostgreSQL (Supabase compatible)

**Architecture:**
- Single database instance
- Connection pooling
- Transaction support
- ACID compliance
- SQL migrations

**Schema Design:**
- Normalized relational schema
- Foreign key constraints
- Indexes for performance
- Triggers for `updated_at`
- UUID primary keys

**Tables:**
- `users` - User accounts
- `customers` - Customer profiles
- `service_providers` - Provider profiles
- `services` - Service listings
- `service_requests` - Booking requests
- `reviews` - Ratings and reviews
- `availability` - Provider schedules

---

### 4. Cache Layer

**Technology:** Redis 7

**Use Cases:**
- Session storage
- User data caching
- Rate limiting
- Request deduplication
- Temporary data storage

**Configuration:**
- In-memory storage
- Persistence enabled (AOF)
- Password protection
- Connection pooling

---

### 5. Infrastructure Layer

**Containerization:** Docker & Docker Compose

**Services:**
- Frontend container
- Backend container
- PostgreSQL container
- Redis container

**Networking:**
- Internal Docker network
- Port mapping
- Health checks
- Service dependencies

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.0 | React framework |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Axios | 1.13.2 | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Go | 1.21+ | Programming language |
| Gin | Latest | Web framework |
| PostgreSQL Driver | Latest | Database driver |
| Redis Client | v9 | Cache client |
| JWT | v5 | Authentication |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| PostgreSQL | Database |
| Redis | Cache |

---

## Data Flow

### Authentication Flow
```
User → Frontend → Backend API → Database
                ↓
            JWT Token
                ↓
            Frontend Storage
```

### Service Request Flow
```
Customer → Frontend → Backend API → Database
                              ↓
                         Redis Cache
                              ↓
                    Provider Notification
```

### Data Retrieval Flow
```
Frontend Request → Backend API → Redis (check cache)
                                      ↓
                              Cache Hit? → Return cached data
                                      ↓
                              Cache Miss → Database Query
                                      ↓
                              Store in cache → Return data
```

---

## Scalability Considerations

### Horizontal Scaling

**Frontend:**
- Stateless Next.js application
- Can scale horizontally behind load balancer
- CDN for static assets
- Edge caching

**Backend:**
- Stateless API servers
- Horizontal scaling via load balancer
- Shared database connection pool
- Redis for shared state

**Database:**
- Connection pooling (max 25 connections per instance)
- Read replicas (future)
- Query optimization
- Indexing strategy

### Vertical Scaling

- Increase container resources
- Database connection pool tuning
- Redis memory allocation
- Application server resources

### Caching Strategy

**Layers:**
1. **Browser Cache** - Static assets
2. **CDN Cache** - Global content distribution
3. **Application Cache** - Redis for frequently accessed data
4. **Database Cache** - Query result caching

**Cache Invalidation:**
- Time-based expiration
- Event-based invalidation
- Manual cache clearing

---

## High Availability

### Redundancy
- Multiple backend instances
- Database replication (future)
- Redis cluster (future)
- Load balancer with health checks

### Health Checks
- `/health` endpoint on backend
- Database connection monitoring
- Redis connection monitoring
- Container health checks

### Failover Strategy
- Automatic container restart
- Health check-based routing
- Graceful degradation
- Error recovery mechanisms

---

## Security Architecture

### Authentication
- JWT tokens (access + refresh)
- Token expiration
- Secure token storage
- Password hashing (bcrypt)

### Authorization
- Role-based access control
- Endpoint-level permissions
- Resource-level access control

### Data Protection
- HTTPS/TLS encryption
- SQL injection prevention
- XSS protection
- CSRF protection
- Input validation

---

## Monitoring & Observability

### Logging
- Structured logging
- Request/response logging
- Error logging
- Performance metrics

### Metrics (Future)
- Request rates
- Response times
- Error rates
- Database query performance
- Cache hit rates

### Tracing (Future)
- Distributed tracing
- Request correlation IDs
- Performance profiling

---

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (Next.js dev server)
├── Backend (Go server)
├── PostgreSQL (Docker)
└── Redis (Docker)
```

### Production (Docker Compose)
```
Docker Network
├── Frontend Container
├── Backend Container
├── PostgreSQL Container
└── Redis Container
```

### Production (Cloud - Future)
```
Load Balancer
├── Frontend (Multiple instances)
├── Backend (Multiple instances)
├── PostgreSQL (Primary + Replicas)
└── Redis Cluster
```

---

## Future Enhancements

### Microservices Migration Path
1. Extract authentication service
2. Extract service management service
3. Extract request management service
4. Implement API Gateway
5. Service mesh integration

### Additional Services
- Email service integration
- SMS notification service
- Payment gateway integration
- File storage service
- Search service (Elasticsearch)

---

## Diagrams

See `High-Level-Architecture/` folder for:
- System architecture diagrams
- Data flow diagrams
- Deployment diagrams

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Maintained By:** Development Team

