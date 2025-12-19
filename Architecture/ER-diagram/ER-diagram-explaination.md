ERD Explanation (Entity Relationship Diagram)
This database schema models a service marketplace platform where customers can book services from verified service providers (similar to TaskRabbit or Thumbtack). It uses a role-based approach with separate profile tables for different user types.
Here are the entities and their relationships:

users (central authentication table)
One user account per person.
Role determines type: 'customer', 'service_provider', or 'admin'.
Contains shared fields: id, email, password, verification tokens, timestamps.

customers
1:1 relationship with users (where role = 'customer')
Foreign key: user_id → users.id (UNIQUE, ON DELETE CASCADE)
Stores customer-specific info: phone, address, location (lat/long).

service_providers
1:1 relationship with users (where role = 'service_provider')
Foreign key: user_id → users.id (UNIQUE, ON DELETE CASCADE)
Stores provider-specific info: business_name, phone, address, location, verification status, rating, etc.

services
Many services belong to one service_provider
Foreign key: provider_id → service_providers.id
Contains: name, category, description, price, duration, active status.

service_requests (bookings)
One customer books one specific service from one provider
Foreign keys:
customer_id → customers.id
provider_id → service_providers.id
service_id → services.id

Status: requested → confirmed → completed/cancelled
Includes requested/scheduled dates, address, notes.

reviews
One review per completed service_request (enforced by UNIQUE on request_id)
Foreign keys:
request_id → service_requests.id (UNIQUE)
customer_id → customers.id
provider_id → service_providers.id

Contains rating (1–5) and optional comment.

availability
Many availability slots per service_provider
Foreign key: provider_id → service_providers.id
Defines weekly recurring available time blocks (day_of_week, start_time, end_time)


Key Relationships Summary:

users 1 → 1 customers (optional, only for customer role)
users 1 → 1 service_providers (optional, only for provider role)
service_providers 1 → N services
service_providers 1 → N availability
customers 1 → N service_requests (as requester)
service_providers 1 → N service_requests (as provider)
services 1 → N service_requests
service_requests 1 → 1 reviews

No direct relationship between customers and service_providers except through service_requests.