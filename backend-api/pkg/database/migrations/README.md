# Database Migrations

This directory contains SQL migration files for the Karigar database schema.

## Migration Files

1. **001_create_users_table.sql** - Creates the users table for authentication
2. **002_create_customers_table.sql** - Creates the customers table
3. **003_create_service_providers_table.sql** - Creates the service_providers table

## Running Migrations

### Using psql (PostgreSQL CLI)

```bash
# Connect to your database
psql -h <host> -U <user> -d <database>

# Run migrations in order
\i pkg/database/migrations/001_create_users_table.sql
\i pkg/database/migrations/002_create_customers_table.sql
\i pkg/database/migrations/003_create_service_providers_table.sql
```

### Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Execute in order (001, 002, 003)

### Using a Migration Tool (Future)

For production, consider using a migration tool like:
- [golang-migrate](https://github.com/golang-migrate/migrate)
- [sql-migrate](https://github.com/rubenv/sql-migrate)

## Migration Naming Convention

Migrations follow the pattern: `XXX_description.sql`
- `XXX` - Sequential number (001, 002, 003, ...)
- `description` - Brief description of what the migration does

## Important Notes

- Always run migrations in order
- Never modify existing migration files (create new ones instead)
- Test migrations on a development database first
- Backup your database before running migrations in production

