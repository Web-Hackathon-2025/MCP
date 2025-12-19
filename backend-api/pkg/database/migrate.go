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
			return fmt.Errorf("failed to execute migration %s: %w", filename, err)
		}

		fmt.Printf("✓ Executed migration: %s\n", filename)
	}

	return nil
}

// RunMigrationsFromPath runs migrations from a given directory path
func RunMigrationsFromPath(db *sql.DB) error {
	// Get the migrations directory path relative to the package
	migrationsDir := filepath.Join("pkg", "database", "migrations")
	
	// Try to find migrations directory
	if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
		// Try absolute path from project root
		migrationsDir = filepath.Join(".", "pkg", "database", "migrations")
		if _, err := os.Stat(migrationsDir); os.IsNotExist(err) {
			return fmt.Errorf("migrations directory not found")
		}
	}

	return RunMigrations(db, migrationsDir)
}

