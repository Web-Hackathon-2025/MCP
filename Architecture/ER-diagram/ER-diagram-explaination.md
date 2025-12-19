# ERD Explanation (Entity Relationship Diagram)

This database schema models a service marketplace platform where customers can book services from verified service providers (similar to TaskRabbit or Thumbtack). It uses a role-based approach with separate profile tables for different user types.

## Entities and Relationships

### 1. Users (`users`)
**Central authentication table**
*   One user account per person.
*   **Role** determines type: `'customer'`, `'service_provider'`, or `'admin'`.
*   Contains shared fields: `id`, `email`, `password`, `verification tokens`, `timestamps`.

### 2. Customers (`customers`)
*   **1:1 relationship** with `users` (where role = `'customer'`)
*   **Foreign key:** `user_id` → `users.id` (UNIQUE, ON DELETE CASCADE)
*   Stores customer-specific info: `phone`, `address`, `location` (lat/long).

### 3. Service Providers (`service_providers`)
*   **1:1 relationship** with `users` (where role = `'service_provider'`)
*   **Foreign key:** `user_id` → `users.id` (UNIQUE, ON DELETE CASCADE)
*   Stores provider-specific info: `business_name`, `phone`, `address`, `location`, `verification status`, `rating`, etc.

### 4. Services (`services`)
*   **Many** services belong to **one** `service_provider`
*   **Foreign key:** `provider_id` → `service_providers.id`
*   Contains: `name`, `category`, `description`, `price`, `duration`, `active status`.

### 5. Service Requests (`service_requests`) – *Bookings*
*   One customer books one specific service from one provider.
*   **Foreign keys:**
    *   `customer_id` → `customers.id`
    *   `provider_id` → `service_providers.id`
    *   `service_id` → `services.id`
*   **Status workflow:** `requested` → `confirmed` → `completed` / `cancelled`
*   Includes requested/scheduled dates, address, notes.

### 6. Reviews (`reviews`)
*   One review per completed `service_request` (enforced by UNIQUE on `request_id`).
*   **Foreign keys:**
    *   `request_id` → `service_requests.id` (UNIQUE)
    *   `customer_id` → `customers.id`
    *   `provider_id` → `service_providers.id`
*   Contains `rating` (1–5) and optional `comment`.

### 7. Availability (`availability`)
*   Many availability slots per `service_provider`.
*   **Foreign key:** `provider_id` → `service_providers.id`
*   Defines weekly recurring available time blocks (`day_of_week`, `start_time`, `end_time`).

---

## Key Relationships Summary

*   **Users** 1 ↔ 1 **Customers** (optional, only for customer role)
*   **Users** 1 ↔ 1 **Service Providers** (optional, only for provider role)
*   **Service Providers** 1 → N **Services**
*   **Service Providers** 1 → N **Availability**
*   **Customers** 1 → N **Service Requests** (as requester)
*   **Service Providers** 1 → N **Service Requests** (as provider)
*   **Services** 1 → N **Service Requests**
*   **Service Requests** 1 ↔ 1 **Reviews**

> **Note:** No direct relationship between `customers` and `service_providers` except through `service_requests`.