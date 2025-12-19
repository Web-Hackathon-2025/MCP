# Supabase Setup Guide for Karigar Backend

This guide explains how to configure the Karigar backend to use Supabase as the database.

## Getting Supabase Credentials

### 1. Database Connection Details

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Find the **Connection string** section
5. Copy the following details:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Port**: `5432` (direct) or `6543` (connection pooling)
   - **Database name**: Usually `postgres`
   - **User**: Usually `postgres`
   - **Password**: Your database password (set during project creation)

### 2. Supabase API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Used for client-side operations
   - **service_role key**: Used for backend operations (keep this secret!)
   - **JWT Secret**: Used for JWT token verification

## Environment Variables (.env.local)

Create a `.env.local` file in the `backend-api` directory with the following:

```env
# Server Configuration
SERVER_PORT=8080
SERVER_HOST=localhost
ENVIRONMENT=development

# Supabase Database Configuration
# Option 1: Direct Connection (for development)
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-database-password-here
DB_NAME=postgres
DB_SSLMODE=require
DB_DRIVER=postgres

# Option 2: Connection Pooling (recommended for production)
# Uncomment and use these instead for better performance
# DB_HOST=db.xxxxxxxxxxxxx.supabase.co
# DB_PORT=6543
# DB_USER=postgres
# DB_PASSWORD=your-database-password-here
# DB_NAME=postgres
# DB_SSLMODE=require
# DB_DRIVER=postgres

# Supabase Project Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
# Use Supabase JWT Secret (found in Settings > API > JWT Secret)
JWT_SECRET=your-supabase-jwt-secret-here

# Optional: Database Connection Pool Settings
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME=300
```

## Connection Modes

### Direct Connection (Port 5432)
- **Use for**: Development, testing
- **Pros**: Simple setup, direct access
- **Cons**: Limited concurrent connections (default: 60)

### Connection Pooling (Port 6543)
- **Use for**: Production, high-traffic applications
- **Pros**: Better connection management, higher concurrency
- **Cons**: Slightly more complex setup

**Note**: Supabase free tier has connection limits. Use connection pooling in production.

## Important Notes

1. **SSL Mode**: Always use `require` or `verify-full` for Supabase (never `disable`)
2. **Password**: Keep your database password secure. Never commit it to version control.
3. **Service Role Key**: This key bypasses Row Level Security (RLS). Use it carefully and only in backend services.
4. **JWT Secret**: Use Supabase's JWT secret if you plan to verify Supabase-generated tokens, or use your own for custom auth.

## Testing the Connection

After setting up your `.env.local` file, test the connection:

```bash
cd backend-api
go run cmd/server/main.go
```

If successful, you should see:
```
Server starting on localhost:8080
```

Test the health endpoint:
```bash
curl http://localhost:8080/health
```

## Troubleshooting

### Connection Refused
- Check that your IP is allowed in Supabase (Settings → Database → Connection Pooling)
- Verify the host and port are correct
- Ensure SSL mode is set to `require`

### Authentication Failed
- Double-check your database password
- Verify the username is `postgres`
- Check that the database name is `postgres`

### SSL Error
- Make sure `DB_SSLMODE=require`
- For local development, you might need to download Supabase's CA certificate

## Next Steps

1. Create database migrations (SQL schema)
2. Run migrations against your Supabase database
3. Implement repository layer with PostgreSQL
4. Test API endpoints

