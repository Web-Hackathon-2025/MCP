package domain

import (
	"time"

	"github.com/google/uuid"
)

// ServiceCategory represents the category of a service
type ServiceCategory string

const (
	CategoryPlumbing      ServiceCategory = "plumbing"
	CategoryElectrical   ServiceCategory = "electrical"
	CategoryCleaning      ServiceCategory = "cleaning"
	CategoryTutoring      ServiceCategory = "tutoring"
	CategoryRepair        ServiceCategory = "repair"
	CategoryOther         ServiceCategory = "other"
)

// Service represents a service offered by a service provider
type Service struct {
	ID          uuid.UUID      `json:"id" db:"id"`
	ProviderID  uuid.UUID      `json:"provider_id" db:"provider_id"`
	Category    ServiceCategory `json:"category" db:"category"`
	Name        string         `json:"name" db:"name"`
	Description string         `json:"description" db:"description"`
	Price       float64        `json:"price" db:"price"`
	Duration    int            `json:"duration" db:"duration"` // Duration in minutes
	IsActive    bool           `json:"is_active" db:"is_active"`
	CreatedAt   time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
}

