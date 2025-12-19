-- Migration: Create service_requests table
-- Description: Creates the service_requests table for booking service requests
-- Created: 2025-12-19

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    requested_date TIMESTAMP NOT NULL,
    scheduled_date TIMESTAMP,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider_id ON service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_id ON service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_scheduled_date ON service_requests(scheduled_date) WHERE scheduled_date IS NOT NULL;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE service_requests IS 'Stores service requests/bookings from customers to service providers';
COMMENT ON COLUMN service_requests.customer_id IS 'Foreign key reference to customers table';
COMMENT ON COLUMN service_requests.provider_id IS 'Foreign key reference to service_providers table';
COMMENT ON COLUMN service_requests.service_id IS 'Foreign key reference to services table';
COMMENT ON COLUMN service_requests.status IS 'Request status: requested, confirmed, completed, cancelled';
COMMENT ON COLUMN service_requests.scheduled_date IS 'Scheduled date and time for the service (nullable)';

