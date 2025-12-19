package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Note: Install Redis client with: go get github.com/redis/go-redis/v9

var (
	client *redis.Client
	ctx    = context.Background()
)

// Config holds Redis configuration
type Config struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// Connect initializes Redis connection
func Connect(cfg *Config) (*redis.Client, error) {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	client = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	// Test connection
	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

// GetClient returns the Redis client instance
func GetClient() *redis.Client {
	return client
}

// Close closes the Redis connection
func Close() error {
	if client != nil {
		return client.Close()
	}
	return nil
}

// Set stores a key-value pair with expiration
func Set(key string, value interface{}, expiration time.Duration) error {
	return client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value by key
func Get(key string) (string, error) {
	return client.Get(ctx, key).Result()
}

// Delete removes a key
func Delete(key string) error {
	return client.Del(ctx, key).Err()
}

// Exists checks if a key exists
func Exists(key string) (bool, error) {
	count, err := client.Exists(ctx, key).Result()
	return count > 0, err
}

// SetNX sets a key only if it doesn't exist (for locking)
func SetNX(key string, value interface{}, expiration time.Duration) (bool, error) {
	return client.SetNX(ctx, key, value, expiration).Result()
}

// Increment increments a key's value
func Increment(key string) (int64, error) {
	return client.Incr(ctx, key).Result()
}

// Expire sets expiration on a key
func Expire(key string, expiration time.Duration) error {
	return client.Expire(ctx, key, expiration).Err()
}

// Keys returns all keys matching a pattern
func Keys(pattern string) ([]string, error) {
	return client.Keys(ctx, pattern).Result()
}

// HSet sets a field in a hash
func HSet(key, field string, value interface{}) error {
	return client.HSet(ctx, key, field, value).Err()
}

// HGet gets a field from a hash
func HGet(key, field string) (string, error) {
	return client.HGet(ctx, key, field).Result()
}

// HGetAll gets all fields from a hash
func HGetAll(key string) (map[string]string, error) {
	return client.HGetAll(ctx, key).Result()
}

// HDel deletes fields from a hash
func HDel(key string, fields ...string) error {
	return client.HDel(ctx, key, fields...).Err()
}

// LPush pushes values to the left of a list
func LPush(key string, values ...interface{}) error {
	return client.LPush(ctx, key, values...).Err()
}

// RPush pushes values to the right of a list
func RPush(key string, values ...interface{}) error {
	return client.RPush(ctx, key, values...).Err()
}

// LPop pops a value from the left of a list
func LPop(key string) (string, error) {
	return client.LPop(ctx, key).Result()
}

// RPop pops a value from the right of a list
func RPop(key string) (string, error) {
	return client.RPop(ctx, key).Result()
}

// LLen returns the length of a list
func LLen(key string) (int64, error) {
	return client.LLen(ctx, key).Result()
}

// SAdd adds members to a set
func SAdd(key string, members ...interface{}) error {
	return client.SAdd(ctx, key, members...).Err()
}

// SMembers returns all members of a set
func SMembers(key string) ([]string, error) {
	return client.SMembers(ctx, key).Result()
}

// SIsMember checks if a member exists in a set
func SIsMember(key string, member interface{}) (bool, error) {
	return client.SIsMember(ctx, key, member).Result()
}

// SRem removes members from a set
func SRem(key string, members ...interface{}) error {
	return client.SRem(ctx, key, members...).Err()
}

