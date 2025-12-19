-- Migration: Create services table
-- Description: Creates the services table for services offered by providers
-- Created: 2025-12-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('plumbing', 'electrical', 'cleaning', 'tutoring', 'repair', 'other')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- Duration in minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active) WHERE is_active = TRUE;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE services IS 'Stores services offered by service providers';
COMMENT ON COLUMN services.provider_id IS 'Foreign key reference to service_providers table';
COMMENT ON COLUMN services.category IS 'Service category: plumbing, electrical, cleaning, tutoring, repair, other';
COMMENT ON COLUMN services.duration IS 'Service duration in minutes';
COMMENT ON COLUMN services.price IS 'Service price';

