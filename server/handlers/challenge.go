package handlers

import (
	"context"
	"crypto/sha256"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/mongo"
)

type Challenge struct {
	UserID string `json:"userId"`
	Claim  string `json:"claim"`
}

// ChallengePost handles challenge check requests
func ChallengePost(c echo.Context) error {
	var requestChallenge Challenge
	if err := c.Bind(&requestChallenge); err != nil {
		return err
	}

	// Get database connection from context
	db := c.Get("db").(*mongo.Database)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := db.Collection("challenges")

	// Generate a unique claim
	claim := fmt.Sprintf("%x", sha256.Sum256([]byte(requestChallenge.UserID+time.Now().String())))

	challenge := Challenge{
		UserID: requestChallenge.UserID,
		Claim:  claim,
	}

	_, err := collection.InsertOne(ctx, challenge)
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "OK",
		"userId": challenge.UserID,
		"claim":  challenge.Claim,
	})
}
