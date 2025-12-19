package domain

import (
	"time"

	"github.com/google/uuid"
)

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleCustomer       UserRole = "customer"
	RoleServiceProvider UserRole = "service_provider"
	RoleAdmin          UserRole = "admin"
)

// User represents a base user in the system
type User struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	Email             string     `json:"email" db:"email"`
	Password          string     `json:"-" db:"password"` // Never return password in JSON
	Role              UserRole   `json:"role" db:"role"`
	IsEmailVerified   bool       `json:"is_email_verified" db:"is_email_verified"`
	EmailVerifyToken  *string    `json:"-" db:"email_verify_token"` // Nullable
	EmailVerifyExpiry *time.Time `json:"-" db:"email_verify_expiry"` // Nullable
	PasswordResetToken *string   `json:"-" db:"password_reset_token"` // Nullable
	PasswordResetExpiry *time.Time `json:"-" db:"password_reset_expiry"` // Nullable
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
}

// Customer represents a customer user
type Customer struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Phone     string    `json:"phone" db:"phone"`
	Address   string    `json:"address" db:"address"`
	Latitude  float64   `json:"latitude" db:"latitude"`
	Longitude float64   `json:"longitude" db:"longitude"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
	User      *User     `json:"user,omitempty"` // For joined queries
}

// ServiceProvider represents a service provider user
type ServiceProvider struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	BusinessName string   `json:"business_name" db:"business_name"`
	Phone       string    `json:"phone" db:"phone"`
	Address     string    `json:"address" db:"address"`
	Latitude    float64   `json:"latitude" db:"latitude"`
	Longitude   float64   `json:"longitude" db:"longitude"`
	IsVerified  bool      `json:"is_verified" db:"is_verified"`
	IsActive    bool      `json:"is_active" db:"is_active"`
	Rating      float64   `json:"rating" db:"rating"`
	TotalReviews int      `json:"total_reviews" db:"total_reviews"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	User        *User     `json:"user,omitempty"` // For joined queries
}

