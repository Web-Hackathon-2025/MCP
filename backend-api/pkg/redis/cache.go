package redis

import (
	"encoding/json"
	"time"
)

// CacheService provides caching functionality
type CacheService struct {
	client *redis.Client
}

// NewCacheService creates a new cache service
func NewCacheService(client *redis.Client) *CacheService {
	return &CacheService{client: client}
}

// SetJSON stores a JSON-serializable object
func (c *CacheService) SetJSON(key string, value interface{}, expiration time.Duration) error {
	jsonData, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return Set(key, jsonData, expiration)
}

// GetJSON retrieves and deserializes a JSON object
func (c *CacheService) GetJSON(key string, dest interface{}) error {
	data, err := Get(key)
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(data), dest)
}

// CacheUser caches user data
func (c *CacheService) CacheUser(userID string, userData interface{}, expiration time.Duration) error {
	key := "user:" + userID
	return c.SetJSON(key, userData, expiration)
}

// GetCachedUser retrieves cached user data
func (c *CacheService) GetCachedUser(userID string, dest interface{}) error {
	key := "user:" + userID
	return c.GetJSON(key, dest)
}

// InvalidateUser invalidates user cache
func (c *CacheService) InvalidateUser(userID string) error {
	key := "user:" + userID
	return Delete(key)
}

// CacheSession stores session data
func (c *CacheService) CacheSession(sessionID string, sessionData interface{}, expiration time.Duration) error {
	key := "session:" + sessionID
	return c.SetJSON(key, sessionData, expiration)
}

// GetCachedSession retrieves cached session data
func (c *CacheService) GetCachedSession(sessionID string, dest interface{}) error {
	key := "session:" + sessionID
	return c.GetJSON(key, dest)
}

// RateLimit checks and increments rate limit counter
func (c *CacheService) RateLimit(key string, limit int, window time.Duration) (bool, error) {
	current, err := Increment(key)
	if err != nil {
		return false, err
	}

	if current == 1 {
		// First request, set expiration
		if err := Expire(key, window); err != nil {
			return false, err
		}
	}

	return current <= int64(limit), nil
}

