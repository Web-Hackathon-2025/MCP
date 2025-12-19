package dto

import "karigar-backend/internal/domain"

// AuthResponse represents the authentication response
type AuthResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         *UserInfo   `json:"user"`
}

// UserInfo represents user information in the response
type UserInfo struct {
	ID        string          `json:"id"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	IsEmailVerified bool      `json:"is_email_verified"`
}

