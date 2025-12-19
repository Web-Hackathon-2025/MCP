package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"karigar-backend/internal/auth/dto"
	"karigar-backend/internal/config"
	"karigar-backend/internal/domain"
	"karigar-backend/internal/repository"
	"karigar-backend/pkg/auth"
)

var (
	ErrUserAlreadyExists    = errors.New("user with this email already exists")
	ErrInvalidCredentials   = errors.New("invalid email or password")
	ErrEmailNotVerified     = errors.New("email not verified")
	ErrInvalidToken         = errors.New("invalid token")
	ErrTokenExpired         = errors.New("token has expired")
	ErrEmailAlreadyVerified = errors.New("email already verified")
)

type AuthService struct {
	userRepo  repository.UserRepository
	jwtMgr    *auth.JWTManager
	config    *config.Config
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		jwtMgr:   auth.NewJWTManager(&cfg.JWT),
		config:   cfg,
	}
}

// Register registers a new user
func (s *AuthService) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, ErrUserAlreadyExists
	}
	// If error is not "user not found", it's a real error (like database connection issue)
	if err != nil {
		// Check if error is "user not found" (expected when user doesn't exist)
		// We need to check the error message since we can't import postgres package here
		errMsg := err.Error()
		if !strings.Contains(errMsg, "user not found") && !strings.Contains(errMsg, "failed to get user by email") {
			return nil, fmt.Errorf("failed to check existing user: %w", err)
		}
		// If it's "user not found", that's fine - user doesn't exist, we can proceed
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Generate email verification token
	verifyToken, err := generateSecureToken()
	if err != nil {
		return nil, err
	}
	verifyExpiry := time.Now().Add(24 * time.Hour)

	// Create user
	user := &domain.User{
		ID:               uuid.New(),
		Email:            req.Email,
		Password:         hashedPassword,
		Role:             req.Role,
		IsEmailVerified:  false,
		EmailVerifyToken: &verifyToken,
		EmailVerifyExpiry: &verifyExpiry,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// TODO: Send verification email (mock for MVP)
	// For MVP, we'll just log the token
	// In production, send email with verification link

	// Generate tokens
	accessToken, refreshToken, err := s.jwtMgr.GenerateTokenPair(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: &dto.UserInfo{
			ID:              user.ID.String(),
			Email:           user.Email,
			Role:            user.Role,
			IsEmailVerified: user.IsEmailVerified,
		},
	}, nil
}

// Login authenticates a user
func (s *AuthService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.AuthResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// Verify password
	if err := auth.ComparePassword(user.Password, req.Password); err != nil {
		return nil, ErrInvalidCredentials
	}

	// Check if email is verified (optional - can be removed for MVP)
	// For MVP, we might allow login without verification
	// if !user.IsEmailVerified {
	// 	return nil, ErrEmailNotVerified
	// }

	// Generate tokens
	accessToken, refreshToken, err := s.jwtMgr.GenerateTokenPair(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: &dto.UserInfo{
			ID:              user.ID.String(),
			Email:           user.Email,
			Role:            user.Role,
			IsEmailVerified: user.IsEmailVerified,
		},
	}, nil
}

// RefreshToken generates a new access token from a refresh token
func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*dto.AuthResponse, error) {
	// Validate refresh token
	claims, err := s.jwtMgr.ValidateToken(refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Get user
	user, err := s.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Generate new token pair
	accessToken, newRefreshToken, err := s.jwtMgr.GenerateTokenPair(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		User: &dto.UserInfo{
			ID:              user.ID.String(),
			Email:           user.Email,
			Role:            user.Role,
			IsEmailVerified: user.IsEmailVerified,
		},
	}, nil
}

// VerifyEmail verifies a user's email
func (s *AuthService) VerifyEmail(ctx context.Context, token string) error {
	// Get user by verification token
	user, err := s.userRepo.GetByEmailVerifyToken(ctx, token)
	if err != nil {
		return ErrInvalidToken
	}

	// Check if already verified
	if user.IsEmailVerified {
		return ErrEmailAlreadyVerified
	}

	// Check if token expired
	if user.EmailVerifyExpiry != nil && time.Now().After(*user.EmailVerifyExpiry) {
		return ErrTokenExpired
	}

	// Verify email
	user.IsEmailVerified = true
	user.EmailVerifyToken = nil
	user.EmailVerifyExpiry = nil

	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return nil
}

// ForgotPassword initiates password reset
func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		// Don't reveal if user exists or not (security best practice)
		return nil
	}

	// Generate reset token
	resetToken, err := generateSecureToken()
	if err != nil {
		return err
	}
	resetExpiry := time.Now().Add(1 * time.Hour) // 1 hour expiry

	// Update user with reset token
	user.PasswordResetToken = &resetToken
	user.PasswordResetExpiry = &resetExpiry

	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	// TODO: Send password reset email (mock for MVP)
	// For MVP, we'll just log the token
	// In production, send email with reset link

	return nil
}

// ResetPassword resets a user's password
func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	// Get user by reset token
	user, err := s.userRepo.GetByPasswordResetToken(ctx, token)
	if err != nil {
		return ErrInvalidToken
	}

	// Check if token expired
	if user.PasswordResetExpiry != nil && time.Now().After(*user.PasswordResetExpiry) {
		return ErrTokenExpired
	}

	// Hash new password
	hashedPassword, err := auth.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Update password and clear reset token
	user.Password = hashedPassword
	user.PasswordResetToken = nil
	user.PasswordResetExpiry = nil

	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return nil
}

// generateSecureToken generates a secure random token
func generateSecureToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

