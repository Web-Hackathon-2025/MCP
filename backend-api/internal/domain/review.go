package domain

import (
	"time"

	"github.com/google/uuid"
)

// Review represents a review/rating given by a customer after service completion
type Review struct {
	ID         uuid.UUID `json:"id" db:"id"`
	RequestID  uuid.UUID `json:"request_id" db:"request_id"`
	CustomerID uuid.UUID `json:"customer_id" db:"customer_id"`
	ProviderID uuid.UUID `json:"provider_id" db:"provider_id"`
	Rating     int       `json:"rating" db:"rating"` // 1-5 scale
	Comment    string    `json:"comment" db:"comment"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
	
	// Joined data (optional)
	Customer *Customer `json:"customer,omitempty"`
}

