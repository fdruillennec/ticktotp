package main

import (
	"fmt"
	"net/http"

	"totp-api/handlers"
	"totp-api/redis"

	"github.com/rs/cors"
)

func main() {
	// Initialize Redis connection
	redis.Init()

	// Define routes
	mux := http.NewServeMux()
	mux.HandleFunc("/generate", handlers.GenerateHandler)
	mux.HandleFunc("/verify", handlers.VerifyHandler)
	mux.HandleFunc("/status", handlers.StatusHandler)

	// Setup CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // ⬅️ Or specify "https://your-domain.com"
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	port := "3000"
	fmt.Printf("✅ Server running at http://0.0.0.0:%s\n", port)

	// Start server with CORS
	err := http.ListenAndServe("0.0.0.0:"+port, corsHandler.Handler(mux))
	if err != nil {
		fmt.Println("❌ Error starting server:", err)
	}
}
