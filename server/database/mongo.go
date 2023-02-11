package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Connect to MongoDB Atlas
func Connect() (*mongo.Client, error) {
	// Define the connection URL to the MongoDB Atlas database
	connURL := os.Getenv("MONGO_URL")

	// Connect to the MongoDB Atlas database
	client, err := mongo.NewClient(options.Client().ApplyURI(connURL))
	if err != nil {
		log.Fatal(err)
	}
	err = client.Connect(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	// Check the connection to the MongoDB Atlas database
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to MongoDB Atlas")
	return client, nil
}
