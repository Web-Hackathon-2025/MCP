# Dashboard Structure - Karigar Platform

## Overview
The dashboard is role-based, showing different content and features for **Customers** and **Service Providers**.

---

## Main Dashboard (`/dashboard`)

### Layout Components
- **Header**: Logo, user email, sign out button
- **Role-based content**: Switches between Customer and Provider dashboards

---

## Customer Dashboard Features

### 1. **Overview Tab** (Default)
- **Stats Cards**:
  - Active Requests
  - Completed Requests  
  - Favorite Providers
- **Quick Actions**:
  - Browse Services
  - New Request
  - My Requests
  - Profile Settings
- **Recent Requests**: List of latest service requests with status

### 2. **Browse Services** (`/dashboard/services`)
- Search/filter by category (Plumbing, Electrical, Cleaning, Tutoring, Repair, Other)
- Map view of nearby providers
- List/grid view of service providers
- Filter by:
  - Distance/radius
  - Rating
  - Price range
  - Category
- Provider cards showing:
  - Business name
  - Rating & reviews
  - Services offered
  - Distance
  - Availability status

### 3. **Service Requests** (`/dashboard/requests`)
- **All Requests**: View all requests (requested, confirmed, completed, cancelled)
- **New Request** (`/dashboard/requests/new`):
  - Select service provider
  - Choose service
  - Set date/time
  - Add address
  - Add notes
  - Submit request
- **Request Details** (`/dashboard/requests/[id]`):
  - View request details
  - Status tracking
  - Provider information
  - Cancel request (if pending)
  - Add review (if completed)

### 4. **Profile** (`/dashboard/profile`)
- Update personal information:
  - Phone number
  - Address
  - Location (latitude/longitude)
- Change password
- Email verification status

---

## Service Provider Dashboard Features

### 1. **Overview Tab** (Default)
- **Stats Cards**:
  - Total Services
  - Active Requests
  - Completed Requests
  - Average Rating & Total Reviews
- **Quick Actions**:
  - Manage Services
  - View Requests
  - Set Availability
  - Business Profile
- **Pending Requests**: List of incoming requests requiring action

### 2. **Manage Services** (`/dashboard/services/manage`)
- **List of Services**:
  - View all services
  - Active/Inactive status
  - Edit/Delete actions
- **Add New Service** (`/dashboard/services/manage/new`):
  - Category selection
  - Service name
  - Description
  - Price
  - Duration (minutes)
  - Active status toggle
- **Edit Service** (`/dashboard/services/manage/[id]`):
  - Edit service details
  - Update pricing
  - Toggle active status

### 3. **Service Requests** (`/dashboard/requests`)
- **Incoming Requests**:
  - View all requests
  - Filter by status (requested, confirmed, completed, cancelled)
  - Accept/Decline actions
  - Schedule date/time
- **Request Details** (`/dashboard/requests/[id]`):
  - View customer information
  - Service details
  - Address & notes
  - Accept/Decline/Complete actions
  - Update status

### 4. **Availability** (`/dashboard/availability`)
- **Set Working Hours**:
  - Day of week selection
  - Start/End time
  - Available/Unavailable toggle
- **Calendar View**: Visual representation of availability
- **Holiday/Time-off Management**

### 5. **Business Profile** (`/dashboard/profile`)
- Update business information:
  - Business name
  - Phone number
  - Address
  - Location (latitude/longitude)
- Verification status
- Change password
- Email verification status

### 6. **Reviews & Ratings** (`/dashboard/reviews`)
- View all reviews received
- Average rating display
- Response to reviews (future feature)

---

## Common Features (Both Roles)

### Navigation
- Dashboard (home)
- Profile
- Settings
- Help/Support

### Authentication
- Sign out functionality
- Token management
- Session handling

---

## API Endpoints Needed

### Customer Endpoints
- `GET /api/v1/customers/profile` - Get customer profile
- `PUT /api/v1/customers/profile` - Update customer profile
- `GET /api/v1/services` - Browse services (with filters)
- `GET /api/v1/providers` - Get service providers (with location filter)
- `POST /api/v1/requests` - Create service request
- `GET /api/v1/requests` - Get customer's requests
- `GET /api/v1/requests/:id` - Get request details
- `PUT /api/v1/requests/:id/cancel` - Cancel request

### Provider Endpoints
- `GET /api/v1/providers/profile` - Get provider profile
- `PUT /api/v1/providers/profile` - Update provider profile
- `GET /api/v1/providers/services` - Get provider's services
- `POST /api/v1/providers/services` - Create service
- `PUT /api/v1/providers/services/:id` - Update service
- `DELETE /api/v1/providers/services/:id` - Delete service
- `GET /api/v1/providers/requests` - Get provider's requests
- `PUT /api/v1/requests/:id/accept` - Accept request
- `PUT /api/v1/requests/:id/decline` - Decline request
- `PUT /api/v1/requests/:id/complete` - Complete request
- `GET /api/v1/providers/availability` - Get availability
- `PUT /api/v1/providers/availability` - Update availability

---

## Next Steps

1. ✅ Create dashboard layout and role-based components
2. ⏳ Implement API integration for fetching user data
3. ⏳ Create service browsing page for customers
4. ⏳ Create service management page for providers
5. ⏳ Create request management pages
6. ⏳ Create profile pages
7. ⏳ Add location/map integration
8. ⏳ Implement real-time updates (WebSocket for request status)

