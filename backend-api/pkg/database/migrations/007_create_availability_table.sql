-- Migration: Create availability table
-- Description: Creates the availability table for service provider schedules
-- Created: 2025-12-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_availability_provider_id ON availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_is_available ON availability(is_available) WHERE is_available = TRUE;

-- Create unique constraint to prevent duplicate schedules for same provider/day
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_provider_day_unique ON availability(provider_id, day_of_week) WHERE is_available = TRUE;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE availability IS 'Stores service provider availability schedules';
COMMENT ON COLUMN availability.provider_id IS 'Foreign key reference to service_providers table';
COMMENT ON COLUMN availability.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN availability.start_time IS 'Start time in HH:MM format';
COMMENT ON COLUMN availability.end_time IS 'End time in HH:MM format';

