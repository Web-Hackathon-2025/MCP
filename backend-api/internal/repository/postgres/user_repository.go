package postgres

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"karigar-backend/internal/domain"
	"karigar-backend/internal/repository"
	"karigar-backend/pkg/database"
)

type userRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository() repository.UserRepository {
	return &userRepository{
		db: database.GetDB(),
	}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (id, email, password, role, is_email_verified, email_verify_token, email_verify_expiry, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	now := time.Now()
	_, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Email,
		user.Password,
		user.Role,
		user.IsEmailVerified,
		user.EmailVerifyToken,
		user.EmailVerifyExpiry,
		now,
		now,
	)

	return err
}

func (r *userRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, email, password, role, is_email_verified, email_verify_token, email_verify_expiry, 
		       password_reset_token, password_reset_expiry, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &domain.User{}
	var emailVerifyToken, passwordResetToken sql.NullString
	var emailVerifyExpiry, passwordResetExpiry sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.IsEmailVerified,
		&emailVerifyToken,
		&emailVerifyExpiry,
		&passwordResetToken,
		&passwordResetExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	if emailVerifyToken.Valid {
		user.EmailVerifyToken = &emailVerifyToken.String
	}
	if emailVerifyExpiry.Valid {
		user.EmailVerifyExpiry = &emailVerifyExpiry.Time
	}
	if passwordResetToken.Valid {
		user.PasswordResetToken = &passwordResetToken.String
	}
	if passwordResetExpiry.Valid {
		user.PasswordResetExpiry = &passwordResetExpiry.Time
	}

	return user, nil
}

func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password, role, is_email_verified, email_verify_token, email_verify_expiry,
		       password_reset_token, password_reset_expiry, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &domain.User{}
	var emailVerifyToken, passwordResetToken sql.NullString
	var emailVerifyExpiry, passwordResetExpiry sql.NullTime

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.IsEmailVerified,
		&emailVerifyToken,
		&emailVerifyExpiry,
		&passwordResetToken,
		&passwordResetExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	if emailVerifyToken.Valid {
		user.EmailVerifyToken = &emailVerifyToken.String
	}
	if emailVerifyExpiry.Valid {
		user.EmailVerifyExpiry = &emailVerifyExpiry.Time
	}
	if passwordResetToken.Valid {
		user.PasswordResetToken = &passwordResetToken.String
	}
	if passwordResetExpiry.Valid {
		user.PasswordResetExpiry = &passwordResetExpiry.Time
	}

	return user, nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET email = $2, password = $3, role = $4, is_email_verified = $5,
		    email_verify_token = $6, email_verify_expiry = $7,
		    password_reset_token = $8, password_reset_expiry = $9,
		    updated_at = $10
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query,
		user.ID,
		user.Email,
		user.Password,
		user.Role,
		user.IsEmailVerified,
		user.EmailVerifyToken,
		user.EmailVerifyExpiry,
		user.PasswordResetToken,
		user.PasswordResetExpiry,
		time.Now(),
	)

	return err
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByEmailVerifyToken gets a user by email verification token
func (r *userRepository) GetByEmailVerifyToken(ctx context.Context, token string) (*domain.User, error) {
	query := `
		SELECT id, email, password, role, is_email_verified, email_verify_token, email_verify_expiry,
		       password_reset_token, password_reset_expiry, created_at, updated_at
		FROM users
		WHERE email_verify_token = $1
	`

	user := &domain.User{}
	var emailVerifyToken, passwordResetToken sql.NullString
	var emailVerifyExpiry, passwordResetExpiry sql.NullTime

	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.IsEmailVerified,
		&emailVerifyToken,
		&emailVerifyExpiry,
		&passwordResetToken,
		&passwordResetExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid verification token")
		}
		return nil, err
	}

	if emailVerifyToken.Valid {
		user.EmailVerifyToken = &emailVerifyToken.String
	}
	if emailVerifyExpiry.Valid {
		user.EmailVerifyExpiry = &emailVerifyExpiry.Time
	}
	if passwordResetToken.Valid {
		user.PasswordResetToken = &passwordResetToken.String
	}
	if passwordResetExpiry.Valid {
		user.PasswordResetExpiry = &passwordResetExpiry.Time
	}

	return user, nil
}

// GetByPasswordResetToken gets a user by password reset token
func (r *userRepository) GetByPasswordResetToken(ctx context.Context, token string) (*domain.User, error) {
	query := `
		SELECT id, email, password, role, is_email_verified, email_verify_token, email_verify_expiry,
		       password_reset_token, password_reset_expiry, created_at, updated_at
		FROM users
		WHERE password_reset_token = $1
	`

	user := &domain.User{}
	var emailVerifyToken, passwordResetToken sql.NullString
	var emailVerifyExpiry, passwordResetExpiry sql.NullTime

	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.IsEmailVerified,
		&emailVerifyToken,
		&emailVerifyExpiry,
		&passwordResetToken,
		&passwordResetExpiry,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("invalid reset token")
		}
		return nil, err
	}

	if emailVerifyToken.Valid {
		user.EmailVerifyToken = &emailVerifyToken.String
	}
	if emailVerifyExpiry.Valid {
		user.EmailVerifyExpiry = &emailVerifyExpiry.Time
	}
	if passwordResetToken.Valid {
		user.PasswordResetToken = &passwordResetToken.String
	}
	if passwordResetExpiry.Valid {
		user.PasswordResetExpiry = &passwordResetExpiry.Time
	}

	return user, nil
}

