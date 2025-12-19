package domain

import (
	"time"

	"github.com/google/uuid"
)

// DayOfWeek represents days of the week
type DayOfWeek int

const (
	Sunday DayOfWeek = iota
	Monday
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
)

// Availability represents the availability schedule of a service provider
type Availability struct {
	ID          uuid.UUID `json:"id" db:"id"`
	ProviderID  uuid.UUID `json:"provider_id" db:"provider_id"`
	DayOfWeek   DayOfWeek `json:"day_of_week" db:"day_of_week"`
	StartTime   string    `json:"start_time" db:"start_time"` // Format: "HH:MM"
	EndTime     string    `json:"end_time" db:"end_time"`     // Format: "HH:MM"
	IsAvailable bool      `json:"is_available" db:"is_available"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

