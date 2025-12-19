package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"karigar-backend/internal/auth/handler"
	"karigar-backend/internal/auth/service"
	"karigar-backend/internal/config"
	"karigar-backend/internal/repository/postgres"
	"karigar-backend/pkg/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env.local or .env file
	if err := godotenv.Load(".env.local"); err != nil {
		// Try .env if .env.local doesn't exist
		if err2 := godotenv.Load(".env"); err2 != nil {
			log.Println("No .env file found, using environment variables")
		}
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode based on environment
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to database
	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Run database migrations
	log.Println("Running database migrations...")
	if err := database.RunMigrationsFromPath(db); err != nil {
		log.Printf("ERROR: Failed to run migrations: %v", err)
		log.Println("Server will continue, but database operations may fail")
		log.Println("Please ensure migrations are run manually or fix the migration path")
	} else {
		log.Println("✓ Database migrations completed successfully")
	}
	
	// Verify users table exists
	var tableExists bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'users'
		);
	`).Scan(&tableExists)
	if err != nil {
		log.Printf("Warning: Could not verify users table: %v", err)
	} else if !tableExists {
		log.Fatal("ERROR: Users table does not exist! Please run migrations.")
	} else {
		log.Println("✓ Users table verified")
	}

	// Initialize Gin router
	router := gin.Default()

	// Add middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(corsMiddleware())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Karigar API is running",
		})
	})

	// Initialize repositories
	userRepo := postgres.NewUserRepository()

	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/verify-email", authHandler.VerifyEmail)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
		}

		// Protected routes will be added here
		// Example:
		// protected := api.Group("")
		// protected.Use(middleware.AuthMiddleware(cfg))
		// {
		//     protected.GET("/profile", userHandler.GetProfile)
		// }
	}

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

// corsMiddleware handles CORS headers
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

