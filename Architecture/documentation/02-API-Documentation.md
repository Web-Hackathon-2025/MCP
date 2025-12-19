# API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
6. [Data Models](#data-models)
7. [Rate Limiting](#rate-limiting)

---

## Overview

Karigar API is a RESTful API built with Go and Gin framework. All endpoints follow REST conventions and return JSON responses.

### API Version
Current version: `v1`  
Base path: `/api/v1`

---

## Base URL

**Development:** `http://localhost:8080/api/v1`  
**Production:** `https://api.karigar.com/api/v1`

---

## Authentication

### JWT Token Authentication

Most endpoints require authentication via JWT Bearer token.

**Header Format:**
```
Authorization: Bearer <access_token>
```

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API requests
   - Stored in `Authorization` header

2. **Refresh Token**
   - Long-lived (7 days)
   - Used to obtain new access tokens
   - Stored securely (httpOnly cookie recommended)

### Obtaining Tokens

**Registration:**
```http
POST /api/v1/auth/register
```

**Login:**
```http
POST /api/v1/auth/login
```

**Refresh:**
```http
POST /api/v1/auth/refresh
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

---

## Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "customer"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "is_email_verified": false
  }
}
```

**Errors:**
- `400` - Invalid input
- `409` - User already exists
- `500` - Server error

---

#### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "is_email_verified": true
  }
}
```

**Errors:**
- `400` - Invalid input
- `401` - Invalid credentials
- `500` - Server error

---

#### Get Current User
```http
GET /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "customer",
  "name": "John Doe",
  "is_email_verified": true
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Server error

---

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "user": { ... }
}
```

---

#### Verify Email
```http
POST /api/v1/auth/verify-email
```

**Request Body:**
```json
{
  "token": "verification_token"
}
```

**Response (200 OK):**
```json
{
  "message": "email verified successfully"
}
```

---

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "if the email exists, a password reset link has been sent"
}
```

---

#### Reset Password
```http
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "password reset successfully"
}
```

---

### Customer Endpoints

#### Get Customer Profile
```http
GET /api/v1/customers/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "phone": "+1234567890",
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "created_at": "2025-12-19T10:00:00Z",
  "updated_at": "2025-12-19T10:00:00Z"
}
```

---

#### Update Customer Profile
```http
PUT /api/v1/customers/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "phone": "+1234567890",
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "phone": "+1234567890",
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

#### Get Customer Requests
```http
GET /api/v1/customers/requests
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: `requested`, `confirmed`, `completed`, `cancelled`
- `limit` (optional) - Number of results (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "provider_id": "uuid",
      "service_id": "uuid",
      "status": "confirmed",
      "requested_date": "2025-12-20T10:00:00Z",
      "scheduled_date": "2025-12-21T14:00:00Z",
      "address": "123 Main St",
      "notes": "Please call before arrival",
      "created_at": "2025-12-19T10:00:00Z",
      "service": {
        "id": "uuid",
        "name": "Plumbing Repair",
        "category": "plumbing",
        "price": 150.00
      },
      "provider": {
        "id": "uuid",
        "business_name": "ABC Plumbing",
        "rating": 4.8
      }
    }
  ],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

---

### Service Provider Endpoints

#### Get Provider Profile
```http
GET /api/v1/providers/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "business_name": "ABC Plumbing",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "is_verified": true,
  "is_active": true,
  "rating": 4.8,
  "total_reviews": 24,
  "created_at": "2025-12-19T10:00:00Z"
}
```

---

#### Update Provider Profile
```http
PUT /api/v1/providers/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "business_name": "ABC Plumbing Services",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "latitude": 40.7580,
  "longitude": -73.9855
}
```

---

#### Get Provider Services
```http
GET /api/v1/providers/services
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "services": [
    {
      "id": "uuid",
      "provider_id": "uuid",
      "category": "plumbing",
      "name": "Plumbing Repair",
      "description": "General plumbing repairs and maintenance",
      "price": 150.00,
      "duration": 60,
      "is_active": true,
      "created_at": "2025-12-19T10:00:00Z"
    }
  ]
}
```

---

#### Create Service
```http
POST /api/v1/providers/services
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "category": "plumbing",
  "name": "Plumbing Repair",
  "description": "General plumbing repairs and maintenance",
  "price": 150.00,
  "duration": 60,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "provider_id": "uuid",
  "category": "plumbing",
  "name": "Plumbing Repair",
  "description": "General plumbing repairs and maintenance",
  "price": 150.00,
  "duration": 60,
  "is_active": true,
  "created_at": "2025-12-19T10:00:00Z"
}
```

---

#### Update Service
```http
PUT /api/v1/providers/services/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Advanced Plumbing Repair",
  "description": "Updated description",
  "price": 175.00,
  "duration": 90,
  "is_active": true
}
```

---

#### Delete Service
```http
DELETE /api/v1/providers/services/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "service deleted successfully"
}
```

---

#### Get Provider Requests
```http
GET /api/v1/providers/requests
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional) - Filter by status
- `limit` (optional)
- `offset` (optional)

**Response (200 OK):**
```json
{
  "requests": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "provider_id": "uuid",
      "service_id": "uuid",
      "status": "requested",
      "requested_date": "2025-12-20T10:00:00Z",
      "address": "123 Main St",
      "notes": "Urgent repair needed",
      "customer": {
        "id": "uuid",
        "user": {
          "email": "customer@example.com"
        }
      },
      "service": {
        "name": "Plumbing Repair",
        "price": 150.00
      }
    }
  ],
  "total": 5
}
```

---

#### Accept Request
```http
PUT /api/v1/requests/:id/accept
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "scheduled_date": "2025-12-21T14:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "scheduled_date": "2025-12-21T14:00:00Z",
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

#### Decline Request
```http
PUT /api/v1/requests/:id/decline
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

#### Complete Request
```http
PUT /api/v1/requests/:id/complete
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "completed",
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

### Service Discovery Endpoints

#### Browse Services
```http
GET /api/v1/services
```

**Query Parameters:**
- `category` (optional) - Filter by category
- `lat` (optional) - Latitude for location-based search
- `lng` (optional) - Longitude for location-based search
- `radius` (optional) - Search radius in km (default: 10)
- `min_rating` (optional) - Minimum rating
- `min_price` (optional) - Minimum price
- `max_price` (optional) - Maximum price
- `limit` (optional) - Results limit
- `offset` (optional) - Pagination offset

**Response (200 OK):**
```json
{
  "services": [
    {
      "id": "uuid",
      "provider": {
        "id": "uuid",
        "business_name": "ABC Plumbing",
        "rating": 4.8,
        "total_reviews": 24,
        "address": "456 Oak Ave",
        "latitude": 40.7580,
        "longitude": -73.9855,
        "distance_km": 2.5
      },
      "category": "plumbing",
      "name": "Plumbing Repair",
      "description": "General plumbing repairs",
      "price": 150.00,
      "duration": 60,
      "is_active": true
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

#### Get Service Providers
```http
GET /api/v1/providers
```

**Query Parameters:**
- `lat` (required) - Latitude
- `lng` (required) - Longitude
- `radius` (optional) - Search radius in km
- `category` (optional) - Service category filter
- `min_rating` (optional) - Minimum rating
- `limit` (optional)
- `offset` (optional)

**Response (200 OK):**
```json
{
  "providers": [
    {
      "id": "uuid",
      "business_name": "ABC Plumbing",
      "phone": "+1234567890",
      "address": "456 Oak Ave",
      "latitude": 40.7580,
      "longitude": -73.9855,
      "is_verified": true,
      "is_active": true,
      "rating": 4.8,
      "total_reviews": 24,
      "distance_km": 2.5,
      "services": [
        {
          "id": "uuid",
          "name": "Plumbing Repair",
          "category": "plumbing",
          "price": 150.00
        }
      ]
    }
  ],
  "total": 8
}
```

---

### Service Request Endpoints

#### Create Service Request
```http
POST /api/v1/requests
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "provider_id": "uuid",
  "service_id": "uuid",
  "requested_date": "2025-12-20T10:00:00Z",
  "address": "123 Main St",
  "notes": "Please call before arrival"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "provider_id": "uuid",
  "service_id": "uuid",
  "status": "requested",
  "requested_date": "2025-12-20T10:00:00Z",
  "address": "123 Main St",
  "notes": "Please call before arrival",
  "created_at": "2025-12-19T10:00:00Z"
}
```

---

#### Get Request Details
```http
GET /api/v1/requests/:id
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "provider_id": "uuid",
  "service_id": "uuid",
  "status": "confirmed",
  "requested_date": "2025-12-20T10:00:00Z",
  "scheduled_date": "2025-12-21T14:00:00Z",
  "address": "123 Main St",
  "notes": "Please call before arrival",
  "customer": { ... },
  "provider": { ... },
  "service": { ... },
  "created_at": "2025-12-19T10:00:00Z",
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

#### Cancel Request
```http
PUT /api/v1/requests/:id/cancel
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "updated_at": "2025-12-19T11:00:00Z"
}
```

---

### Reviews Endpoints

#### Create Review
```http
POST /api/v1/reviews
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "request_id": "uuid",
  "provider_id": "uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "request_id": "uuid",
  "customer_id": "uuid",
  "provider_id": "uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional.",
  "created_at": "2025-12-19T12:00:00Z"
}
```

---

#### Get Provider Reviews
```http
GET /api/v1/providers/:id/reviews
```

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

**Response (200 OK):**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "customer": {
        "user": {
          "email": "customer@example.com"
        }
      },
      "rating": 5,
      "comment": "Excellent service!",
      "created_at": "2025-12-19T12:00:00Z"
    }
  ],
  "total": 24,
  "average_rating": 4.8
}
```

---

### Availability Endpoints

#### Get Provider Availability
```http
GET /api/v1/providers/availability
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "availability": [
    {
      "id": "uuid",
      "provider_id": "uuid",
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    }
  ]
}
```

---

#### Update Availability
```http
PUT /api/v1/providers/availability
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "availability": [
    {
      "day_of_week": "monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    },
    {
      "day_of_week": "tuesday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    }
  ]
}
```

---

## Data Models

### User
```typescript
{
  id: string (UUID)
  email: string
  role: "customer" | "service_provider" | "admin"
  is_email_verified: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### Customer
```typescript
{
  id: string (UUID)
  user_id: string (UUID)
  phone: string
  address: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}
```

### Service Provider
```typescript
{
  id: string (UUID)
  user_id: string (UUID)
  business_name: string
  phone: string
  address: string
  latitude: number
  longitude: number
  is_verified: boolean
  is_active: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}
```

### Service
```typescript
{
  id: string (UUID)
  provider_id: string (UUID)
  category: "plumbing" | "electrical" | "cleaning" | "tutoring" | "repair" | "other"
  name: string
  description: string
  price: number
  duration: number (minutes)
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Service Request
```typescript
{
  id: string (UUID)
  customer_id: string (UUID)
  provider_id: string (UUID)
  service_id: string (UUID)
  status: "requested" | "confirmed" | "completed" | "cancelled"
  requested_date: string (ISO 8601)
  scheduled_date: string (ISO 8601) | null
  address: string
  notes: string
  created_at: string
  updated_at: string
}
```

### Review
```typescript
{
  id: string (UUID)
  request_id: string (UUID)
  customer_id: string (UUID)
  provider_id: string (UUID)
  rating: number (1-5)
  comment: string
  created_at: string
  updated_at: string
}
```

---

## Rate Limiting

### Current Limits
- **Authentication endpoints**: 10 requests per minute
- **General API endpoints**: 100 requests per minute per user
- **Search endpoints**: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

### Rate Limit Exceeded Response
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```
Status Code: `429 Too Many Requests`

---

## Pagination

### Query Parameters
- `limit` - Number of results (default: 20, max: 100)
- `offset` - Number of results to skip (default: 0)

### Response Format
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

---

## Filtering & Sorting

### Common Filters
- `status` - Filter by status
- `category` - Filter by category
- `min_rating` - Minimum rating
- `min_price` / `max_price` - Price range
- `is_active` - Active status filter

### Sorting
- `sort_by` - Field to sort by
- `order` - `asc` or `desc` (default: `desc`)

Example:
```
GET /api/v1/services?sort_by=rating&order=desc&min_rating=4.0
```

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**API Version:** v1

