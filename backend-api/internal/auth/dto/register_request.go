package dto

import "karigar-backend/internal/domain"

// RegisterRequest represents the request body for user registration
type RegisterRequest struct {
	Email    string          `json:"email" binding:"required,email"`
	Password string          `json:"password" binding:"required,min=8"`
	Role     domain.UserRole `json:"role" binding:"required,oneof=customer service_provider"`
	Name     string          `json:"name" binding:"required,min=2"`
}

