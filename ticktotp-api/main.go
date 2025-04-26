package main

import (
	"fmt"
	"net/http"
	"totp-api/handlers"
	"totp-api/redis"

	"github.com/rs/cors"
)

func main() {
	redis.Init()

	// Enable CORS support
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},         // Allow frontend origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},  // Allow common HTTP methods
		AllowedHeaders: []string{"Content-Type", "Authorization"}, // Allow headers
	})

	// Register the routes
	http.HandleFunc("/generate", handlers.GenerateHandler)
	http.HandleFunc("/verify", handlers.VerifyHandler)
	http.HandleFunc("/status", handlers.StatusHandler)

	// Apply CORS handler to the routes
	fmt.Println("Server running at http://0.0.0.0:8080")
	err := http.ListenAndServe("0.0.0.0:8080", corsHandler.Handler(http.DefaultServeMux))
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}
