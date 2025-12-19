-- Migration: Create service_providers table
-- Description: Creates the service_providers table for service provider information
-- Created: 2025-12-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_location ON service_providers(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON service_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_verified ON service_providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON service_providers(rating DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE service_providers IS 'Stores service provider-specific information linked to users table';
COMMENT ON COLUMN service_providers.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN service_providers.business_name IS 'Name of the service provider business';
COMMENT ON COLUMN service_providers.is_verified IS 'Whether the provider has been verified by admin';
COMMENT ON COLUMN service_providers.is_active IS 'Whether the provider is currently active';
COMMENT ON COLUMN service_providers.rating IS 'Average rating (0-5)';
COMMENT ON COLUMN service_providers.total_reviews IS 'Total number of reviews received';

