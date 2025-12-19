package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

// RunMigrations runs all SQL migration files in the migrations directory
func RunMigrations(db *sql.DB, migrationsDir string) error {
	// Read migration files
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Filter and sort migration files
	var migrationFiles []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, file.Name())
		}
	}

	sort.Strings(migrationFiles)

	// Execute migrations in order
	for _, filename := range migrationFiles {
		filePath := filepath.Join(migrationsDir, filename)
		sqlContent, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		// Execute migration
		if _, err := db.Exec(string(sqlContent)); err != nil {
			// Check if error is about table already existing (not a fatal error)
			errStr := err.Error()
			if strings.Contains(errStr, "already exists") || strings.Contains(errStr, "duplicate") {
				fmt.Printf("⚠ Migration %s skipped (already applied): %v\n", filename, err)
				continue
			}
			return fmt.Errorf("failed to execute migration %s: %w", filename, err)
		}

		fmt.Printf("✓ Executed migration: %s\n", filename)
	}

	return nil
}

// RunMigrationsFromPath runs migrations from a given directory path
func RunMigrationsFromPath(db *sql.DB) error {
	// Get the current working directory
	wd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	// Try multiple possible paths for migrations directory
	// When running from cmd/server/main.go, we need to go up to backend-api root
	possiblePaths := []string{
		filepath.Join(wd, "..", "..", "pkg", "database", "migrations"), // From cmd/server
		filepath.Join(wd, "pkg", "database", "migrations"),             // From backend-api root
		filepath.Join("pkg", "database", "migrations"),                 // Relative
		filepath.Join(".", "pkg", "database", "migrations"),            // Current dir
	}

	var migrationsDir string
	var found bool

	for _, path := range possiblePaths {
		absPath, _ := filepath.Abs(path)
		if _, err := os.Stat(path); err == nil {
			migrationsDir = path
			found = true
			fmt.Printf("Found migrations directory at: %s\n", absPath)
			break
		}
	}

	if !found {
		return fmt.Errorf("migrations directory not found. Working directory: %s, Tried: %v", wd, possiblePaths)
	}

	return RunMigrations(db, migrationsDir)
}
