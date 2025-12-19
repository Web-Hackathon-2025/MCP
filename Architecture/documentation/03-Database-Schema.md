# Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Schema Design Principles](#schema-design-principles)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Tables](#tables)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [Triggers](#triggers)
8. [Migrations](#migrations)

---

## Overview

Karigar uses **PostgreSQL** as the primary database. The schema is designed for a hyperlocal services marketplace with support for customers, service providers, services, bookings, reviews, and availability management.

### Database Information
- **Database Type:** PostgreSQL 15+
- **Character Set:** UTF-8
- **Collation:** en_US.UTF-8
- **UUID Extension:** uuid-ossp

---

## Schema Design Principles

### 1. Normalization
- Third Normal Form (3NF) compliance
- Eliminated data redundancy
- Proper foreign key relationships

### 2. UUID Primary Keys
- All tables use UUID v4 as primary keys
- Better for distributed systems
- Prevents enumeration attacks

### 3. Timestamps
- `created_at` - Record creation time
- `updated_at` - Auto-updated on modification
- Timezone-aware (UTC)

### 4. Soft Deletes
- Future consideration for soft deletes
- Currently using hard deletes

### 5. Audit Trail
- Timestamps for all records
- Future: Add `created_by`, `updated_by` fields

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │
│ email       │◄─────┐
│ password    │      │
│ role        │      │
│ ...         │      │
└─────────────┘      │
      │              │
      │              │
      ├──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  customers  │ │service_prov│ │    admin   │
│─────────────│ │   iders    │ │  (future)  │
│ id (PK)     │ │─────────────│ │────────────│
│ user_id(FK) │ │ id (PK)     │ │ ...        │
│ phone       │ │ user_id(FK) │ └────────────┘
│ address     │ │ business_   │
│ lat/lng     │ │   name      │
└─────────────┘ │ rating      │
      │          └─────────────┘
      │                │
      │                │
      │                ▼
      │          ┌─────────────┐
      │          │  services   │
      │          │─────────────│
      │          │ id (PK)     │
      │          │ provider_   │
      │          │   id (FK)   │
      │          │ category    │
      │          │ price       │
      │          └─────────────┘
      │                │
      │                │
      ▼                ▼
┌─────────────┐ ┌─────────────┐
│service_     │ │  reviews    │
│ requests    │ │─────────────│
│─────────────│ │ id (PK)     │
│ id (PK)     │ │ request_id  │
│ customer_   │ │   (FK)      │
│   id (FK)   │ │ rating      │
│ provider_   │ │ comment     │
│   id (FK)   │ └─────────────┘
│ service_    │
│   id (FK)   │
│ status      │
│ ...         │
└─────────────┘
```

---

## Tables

### 1. users

Stores user authentication and basic account information.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(50) | NOT NULL, CHECK | User role: customer, service_provider, admin |
| `is_email_verified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `email_verify_token` | VARCHAR(255) | NULLABLE | Email verification token |
| `email_verify_expiry` | TIMESTAMP | NULLABLE | Token expiration time |
| `password_reset_token` | VARCHAR(255) | NULLABLE | Password reset token |
| `password_reset_expiry` | TIMESTAMP | NULLABLE | Reset token expiration |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` - On `email`
- `idx_users_role` - On `role`
- `idx_users_email_verify_token` - On `email_verify_token` (partial, WHERE token IS NOT NULL)
- `idx_users_password_reset_token` - On `password_reset_token` (partial, WHERE token IS NOT NULL)

**Constraints:**
- `role` CHECK constraint: `role IN ('customer', 'service_provider', 'admin')`
- `email` UNIQUE constraint

---

### 2. customers

Stores customer-specific profile information.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique customer identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, UNIQUE, NOT NULL | Reference to users table |
| `phone` | VARCHAR(20) | NULLABLE | Phone number |
| `address` | TEXT | NULLABLE | Physical address |
| `latitude` | DECIMAL(10,8) | NULLABLE | Location latitude |
| `longitude` | DECIMAL(11,8) | NULLABLE | Location longitude |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_customers_user_id` - On `user_id`
- `idx_customers_location` - On `latitude`, `longitude` (for geospatial queries)

**Foreign Keys:**
- `user_id` → `users.id` ON DELETE CASCADE

---

### 3. service_providers

Stores service provider business information and metrics.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique provider identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, UNIQUE, NOT NULL | Reference to users table |
| `business_name` | VARCHAR(255) | NOT NULL | Business/company name |
| `phone` | VARCHAR(20) | NULLABLE | Business phone |
| `address` | TEXT | NULLABLE | Business address |
| `latitude` | DECIMAL(10,8) | NULLABLE | Business location latitude |
| `longitude` | DECIMAL(11,8) | NULLABLE | Business location longitude |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Verification status |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `rating` | DECIMAL(3,2) | DEFAULT 0.00 | Average rating (0.00-5.00) |
| `total_reviews` | INTEGER | DEFAULT 0 | Total number of reviews |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_service_providers_user_id` - On `user_id`
- `idx_service_providers_location` - On `latitude`, `longitude` (for geospatial search)
- `idx_service_providers_rating` - On `rating` (for sorting)
- `idx_service_providers_active` - On `is_active` (for filtering)

**Foreign Keys:**
- `user_id` → `users.id` ON DELETE CASCADE

**Computed Fields:**
- `rating` and `total_reviews` are maintained via triggers on reviews table

---

### 4. services

Stores individual services offered by providers.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique service identifier |
| `provider_id` | UUID | FOREIGN KEY → service_providers.id, NOT NULL | Provider offering the service |
| `category` | VARCHAR(50) | NOT NULL, CHECK | Service category |
| `name` | VARCHAR(255) | NOT NULL | Service name |
| `description` | TEXT | NULLABLE | Service description |
| `price` | DECIMAL(10,2) | NOT NULL | Service price |
| `duration` | INTEGER | NOT NULL | Duration in minutes |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_services_provider_id` - On `provider_id`
- `idx_services_category` - On `category`
- `idx_services_active` - On `is_active`

**Foreign Keys:**
- `provider_id` → `service_providers.id` ON DELETE CASCADE

**Constraints:**
- `category` CHECK: `category IN ('plumbing', 'electrical', 'cleaning', 'tutoring', 'repair', 'other')`
- `price` CHECK: `price >= 0`
- `duration` CHECK: `duration > 0`

---

### 5. service_requests

Stores service booking requests from customers to providers.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique request identifier |
| `customer_id` | UUID | FOREIGN KEY → customers.id, NOT NULL | Customer making request |
| `provider_id` | UUID | FOREIGN KEY → service_providers.id, NOT NULL | Provider receiving request |
| `service_id` | UUID | FOREIGN KEY → services.id, NOT NULL | Service being requested |
| `status` | VARCHAR(50) | NOT NULL, CHECK | Request status |
| `requested_date` | TIMESTAMP | NOT NULL | When service is requested |
| `scheduled_date` | TIMESTAMP | NULLABLE | Scheduled service date/time |
| `address` | TEXT | NOT NULL | Service location address |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_service_requests_customer_id` - On `customer_id`
- `idx_service_requests_provider_id` - On `provider_id`
- `idx_service_requests_service_id` - On `service_id`
- `idx_service_requests_status` - On `status`
- `idx_service_requests_scheduled_date` - On `scheduled_date`

**Foreign Keys:**
- `customer_id` → `customers.id` ON DELETE CASCADE
- `provider_id` → `service_providers.id` ON DELETE CASCADE
- `service_id` → `services.id` ON DELETE RESTRICT

**Constraints:**
- `status` CHECK: `status IN ('requested', 'confirmed', 'completed', 'cancelled')`

---

### 6. reviews

Stores customer reviews and ratings for completed services.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique review identifier |
| `request_id` | UUID | FOREIGN KEY → service_requests.id, UNIQUE, NOT NULL | Associated request |
| `customer_id` | UUID | FOREIGN KEY → customers.id, NOT NULL | Customer writing review |
| `provider_id` | UUID | FOREIGN KEY → service_providers.id, NOT NULL | Provider being reviewed |
| `rating` | INTEGER | NOT NULL, CHECK | Rating (1-5) |
| `comment` | TEXT | NULLABLE | Review comment |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_reviews_request_id` - On `request_id`
- `idx_reviews_customer_id` - On `customer_id`
- `idx_reviews_provider_id` - On `provider_id`
- `idx_reviews_rating` - On `rating`

**Foreign Keys:**
- `request_id` → `service_requests.id` ON DELETE CASCADE
- `customer_id` → `customers.id` ON DELETE CASCADE
- `provider_id` → `service_providers.id` ON DELETE CASCADE

**Constraints:**
- `rating` CHECK: `rating >= 1 AND rating <= 5`
- One review per request (UNIQUE constraint on `request_id`)

---

### 7. availability

Stores provider working hours and availability schedules.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique availability identifier |
| `provider_id` | UUID | FOREIGN KEY → service_providers.id, NOT NULL | Provider |
| `day_of_week` | VARCHAR(20) | NOT NULL, CHECK | Day of week |
| `start_time` | TIME | NOT NULL | Start time |
| `end_time` | TIME | NOT NULL | End time |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_availability_provider_id` - On `provider_id`
- `idx_availability_day` - On `day_of_week`
- `idx_availability_provider_day` - Composite on `provider_id`, `day_of_week`

**Foreign Keys:**
- `provider_id` → `service_providers.id` ON DELETE CASCADE

**Constraints:**
- `day_of_week` CHECK: `day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`
- `end_time` > `start_time` (application-level validation)

---

## Indexes

### Performance Indexes

**Geospatial Indexes:**
- `idx_customers_location` - For location-based customer queries
- `idx_service_providers_location` - For nearby provider searches

**Lookup Indexes:**
- All foreign key columns are indexed
- Status and category columns are indexed for filtering

**Composite Indexes:**
- `idx_availability_provider_day` - For efficient availability lookups

### Index Strategy

1. **Primary Keys:** Automatically indexed
2. **Foreign Keys:** Indexed for join performance
3. **Filter Columns:** Indexed (status, category, is_active)
4. **Search Columns:** Indexed (email, business_name)
5. **Geospatial:** Indexed for location queries

---

## Constraints

### Check Constraints

1. **User Role:** `role IN ('customer', 'service_provider', 'admin')`
2. **Service Category:** `category IN ('plumbing', 'electrical', 'cleaning', 'tutoring', 'repair', 'other')`
3. **Request Status:** `status IN ('requested', 'confirmed', 'completed', 'cancelled')`
4. **Rating:** `rating >= 1 AND rating <= 5`
5. **Price:** `price >= 0`
6. **Duration:** `duration > 0`
7. **Day of Week:** Valid day names

### Unique Constraints

1. `users.email` - Unique email addresses
2. `customers.user_id` - One customer profile per user
3. `service_providers.user_id` - One provider profile per user
4. `reviews.request_id` - One review per request

### Foreign Key Constraints

All foreign keys use:
- **ON DELETE CASCADE** - Child records deleted when parent deleted
- **ON DELETE RESTRICT** - Prevents deletion if referenced (for services)

---

## Triggers

### 1. update_updated_at_column()

Automatically updates `updated_at` timestamp on record modification.

**Applied to:**
- users
- customers
- service_providers
- services
- service_requests
- reviews
- availability

**Function:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

**Trigger:**
```sql
CREATE TRIGGER update_<table>_updated_at 
BEFORE UPDATE ON <table>
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### 2. update_provider_rating() (Future)

Automatically recalculates provider rating when reviews are added/updated/deleted.

---

## Migrations

### Migration Files

Located in: `backend-api/pkg/database/migrations/`

1. `001_create_users_table.sql` - Users table
2. `002_create_customers_table.sql` - Customers table
3. `003_create_service_providers_table.sql` - Service providers table
4. `004_create_services_table.sql` - Services table
5. `005_create_service_requests_table.sql` - Service requests table
6. `006_create_reviews_table.sql` - Reviews table
7. `007_create_availability_table.sql` - Availability table

### Migration Execution

Migrations run automatically on server startup. They are idempotent (safe to run multiple times).

**Manual Execution:**
```bash
# Using Go
go run cmd/server/main.go migrate

# Using Docker
docker-compose exec backend ./server migrate
```

---

## Data Types

### UUID
- Used for all primary keys
- Generated using `uuid_generate_v4()`
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Timestamps
- `TIMESTAMP` type (timezone-aware)
- Stored in UTC
- Displayed in user's timezone (application layer)

### Decimals
- `DECIMAL(10,2)` for prices (supports up to 99,999,999.99)
- `DECIMAL(3,2)` for ratings (0.00 to 5.00)
- `DECIMAL(10,8)` / `DECIMAL(11,8)` for coordinates

### Text Fields
- `VARCHAR(255)` for short text (names, emails)
- `TEXT` for longer content (descriptions, addresses, comments)

---

## Query Optimization

### Recommended Queries

**Nearby Providers:**
```sql
SELECT *, 
  (6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * 
   cos(radians(longitude) - radians($lng)) + 
   sin(radians($lat)) * sin(radians(latitude)))) AS distance_km
FROM service_providers
WHERE is_active = true
HAVING distance_km < $radius
ORDER BY distance_km
LIMIT $limit;
```

**Provider Services with Stats:**
```sql
SELECT s.*, 
       COUNT(DISTINCT sr.id) as total_requests,
       AVG(r.rating) as avg_rating
FROM services s
LEFT JOIN service_requests sr ON s.id = sr.service_id
LEFT JOIN reviews r ON sr.id = r.request_id
WHERE s.provider_id = $provider_id
GROUP BY s.id;
```

---

## Backup & Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery (PITR)
- Backup retention: 30 days

### Recovery Procedures
1. Restore from latest backup
2. Apply migrations
3. Verify data integrity
4. Test application functionality

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Database Version:** PostgreSQL 15+

