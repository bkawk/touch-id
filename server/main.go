package main

import (
	"bkawk/touch-id/database"
	"bkawk/touch-id/handlers"
	"context"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/juju/ratelimit"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {

	// Initialize Echo
	e := echo.New()

	// Load .env file
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	// Connect to MongoDB Atlas
	client, err := database.Connect()
	if err != nil {
		return
	}
	defer client.Disconnect(context.TODO())

	// Limit the number of requests to 1 requests per second with a burst of 20 requests
	limiter := ratelimit.NewBucketWithQuantum(1, 20, 1)
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if limiter.TakeAvailable(1) == 0 {
				msg := "Rate limit exceeded"
				return c.String(http.StatusTooManyRequests, msg)
			}
			return next(c)
		}
	})

	// Inject MongoDB client into Echo using middleware
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("db", client.Database(os.Getenv("MONGO_DB")))
			return next(c)
		}
	})

	// Configure CORS middleware
	config := middleware.CORSConfig{
		// AllowOrigins: []string{"http://www.mydomain.com"},
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}
	e.Use(middleware.CORSWithConfig(config))

	// Limit Body Size
	e.Use(middleware.BodyLimit("100K"))

	// Add middleware to be more secure with xss etc
	e.Use(middleware.Secure())

	// Routes
	e.GET("/health", handlers.HealthGet)         // Health Check
	e.POST("/challenge", handlers.ChallengePost) // challenge

	// Start server
	e.Logger.Fatal(e.Start(os.Getenv("PORT")))
}
