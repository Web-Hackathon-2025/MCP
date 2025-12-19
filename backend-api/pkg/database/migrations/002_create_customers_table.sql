-- Migration: Create customers table
-- Description: Creates the customers table for customer-specific information
-- Created: 2025-12-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE customers IS 'Stores customer-specific information linked to users table';
COMMENT ON COLUMN customers.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN customers.latitude IS 'Customer location latitude for geospatial queries';
COMMENT ON COLUMN customers.longitude IS 'Customer location longitude for geospatial queries';

