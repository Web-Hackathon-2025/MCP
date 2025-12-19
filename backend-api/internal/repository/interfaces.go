package repository

import (
	"context"

	"karigar-backend/internal/domain"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
}

// CustomerRepository defines the interface for customer data operations
type CustomerRepository interface {
	Create(ctx context.Context, customer *domain.Customer) error
	GetByID(ctx context.Context, id string) (*domain.Customer, error)
	GetByUserID(ctx context.Context, userID string) (*domain.Customer, error)
	Update(ctx context.Context, customer *domain.Customer) error
	GetNearby(ctx context.Context, lat, lng float64, radiusKm float64) ([]*domain.Customer, error)
}

// ServiceProviderRepository defines the interface for service provider data operations
type ServiceProviderRepository interface {
	Create(ctx context.Context, provider *domain.ServiceProvider) error
	GetByID(ctx context.Context, id string) (*domain.ServiceProvider, error)
	GetByUserID(ctx context.Context, userID string) (*domain.ServiceProvider, error)
	Update(ctx context.Context, provider *domain.ServiceProvider) error
	Search(ctx context.Context, lat, lng float64, radiusKm float64, category *domain.ServiceCategory) ([]*domain.ServiceProvider, error)
	GetAll(ctx context.Context, limit, offset int) ([]*domain.ServiceProvider, error)
}

// ServiceRepository defines the interface for service data operations
type ServiceRepository interface {
	Create(ctx context.Context, service *domain.Service) error
	GetByID(ctx context.Context, id string) (*domain.Service, error)
	GetByProviderID(ctx context.Context, providerID string) ([]*domain.Service, error)
	Update(ctx context.Context, service *domain.Service) error
	Delete(ctx context.Context, id string) error
}

// ServiceRequestRepository defines the interface for service request data operations
type ServiceRequestRepository interface {
	Create(ctx context.Context, request *domain.ServiceRequest) error
	GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error)
	GetByCustomerID(ctx context.Context, customerID string) ([]*domain.ServiceRequest, error)
	GetByProviderID(ctx context.Context, providerID string) ([]*domain.ServiceRequest, error)
	Update(ctx context.Context, request *domain.ServiceRequest) error
	UpdateStatus(ctx context.Context, id string, status domain.RequestStatus) error
}

// ReviewRepository defines the interface for review data operations
type ReviewRepository interface {
	Create(ctx context.Context, review *domain.Review) error
	GetByID(ctx context.Context, id string) (*domain.Review, error)
	GetByProviderID(ctx context.Context, providerID string) ([]*domain.Review, error)
	GetByRequestID(ctx context.Context, requestID string) (*domain.Review, error)
	Update(ctx context.Context, review *domain.Review) error
	GetAverageRating(ctx context.Context, providerID string) (float64, int, error)
}

// AvailabilityRepository defines the interface for availability data operations
type AvailabilityRepository interface {
	Create(ctx context.Context, availability *domain.Availability) error
	GetByProviderID(ctx context.Context, providerID string) ([]*domain.Availability, error)
	Update(ctx context.Context, availability *domain.Availability) error
	Delete(ctx context.Context, id string) error
}

