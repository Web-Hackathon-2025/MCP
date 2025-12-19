package domain

import (
	"time"

	"github.com/google/uuid"
)

// RequestStatus represents the status of a service request
type RequestStatus string

const (
	StatusRequested RequestStatus = "requested"
	StatusConfirmed RequestStatus = "confirmed"
	StatusCompleted RequestStatus = "completed"
	StatusCancelled RequestStatus = "cancelled"
)

// ServiceRequest represents a service request from a customer to a service provider
type ServiceRequest struct {
	ID            uuid.UUID     `json:"id" db:"id"`
	CustomerID    uuid.UUID     `json:"customer_id" db:"customer_id"`
	ProviderID    uuid.UUID     `json:"provider_id" db:"provider_id"`
	ServiceID     uuid.UUID     `json:"service_id" db:"service_id"`
	Status        RequestStatus `json:"status" db:"status"`
	RequestedDate time.Time     `json:"requested_date" db:"requested_date"`
	ScheduledDate *time.Time    `json:"scheduled_date" db:"scheduled_date"` // Nullable
	Address       string        `json:"address" db:"address"`
	Notes         string        `json:"notes" db:"notes"`
	CreatedAt     time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at" db:"updated_at"`

	// Joined data (optional)
	Customer *Customer        `json:"customer,omitempty"`
	Provider *ServiceProvider `json:"provider,omitempty"`
	Service  *Service         `json:"service,omitempty"`
}
