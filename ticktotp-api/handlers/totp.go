package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"

	"totp-api/redis"
	"totp-api/utils"

	"github.com/pquerna/otp/totp"
	"github.com/skip2/go-qrcode"
)

type GenerateRequest struct {
	Email string `json:"email"`
}

type VerifyRequest struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type TOTPSecretResponse struct {
	Secret  string `json:"secret"`
	OTPAuth string `json:"otpauth_url"`
	QRCode  string `json:"qrcode_base64"`
}

type VerifyResponse struct {
	Valid bool `json:"valid"`
}

// IsValidEmail returns true if the email is in a valid format.
func IsValidEmail(email string) bool {
	// Basic regex for email validation
	regex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return regex.MatchString(email)
}

// StatusHandler checks if the email exists in Redis and returns a JSON response
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Check if the request method is GET
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// Check if the request is from the allowed origin
	allowedOrigin := "http://localhost:5173" // Replace with your frontend origin
	if r.Header.Get("Origin") != allowedOrigin {
		http.Error(w, "Origin not allowed", http.StatusForbidden)
		return
	}
	// Check if the parameter email is present
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Missing email parameter", http.StatusBadRequest)
		return
	}
	// Check if the email is valid
	if !IsValidEmail(email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}
	// Check if the email exists in Redis
	inRedis, err := redis.EmailExists(email)
	if err != nil {
		http.Error(w, "Error checking email existence", http.StatusInternalServerError)
		return
	}
	// If the email exists, return a 200 OK response
	if inRedis {
		w.WriteHeader(http.StatusOK)
		response := map[string]string{"status": "ok"}
		json.NewEncoder(w).Encode(response)
		return
	}
	// If the email does not exist, return a 404 Not Found response
	w.WriteHeader(http.StatusNotFound)
	response := map[string]string{"status": "not found"}
	json.NewEncoder(w).Encode(response)
}

func GenerateHandler(w http.ResponseWriter, r *http.Request) {
	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		http.Error(w, "Missing or invalid email", http.StatusBadRequest)
		return
	}

	secret, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "TickTOTP",
		AccountName: req.Email,
	})
	if err != nil {
		http.Error(w, "Failed to generate TOTP", http.StatusInternalServerError)
		return
	}

	err = redis.Client.Set(redis.Ctx, req.Email, secret.Secret(), 0).Err()
	if err != nil {
		http.Error(w, "Failed to store secret", http.StatusInternalServerError)
		return
	}

	qr, err := qrcode.Encode(secret.URL(), qrcode.Medium, 256)
	if err != nil {
		http.Error(w, "Failed to generate QR code", http.StatusInternalServerError)
		return
	}

	resp := TOTPSecretResponse{
		Secret:  secret.Secret(),
		OTPAuth: secret.URL(),
		QRCode:  "data:image/png;base64," + utils.EncodeToBase64(qr),
	}
	utils.WriteJSON(w, resp)
}

func VerifyHandler(w http.ResponseWriter, r *http.Request) {
	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Token == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	secret, err := redis.Client.Get(redis.Ctx, req.Email).Result()
	if err != nil {
		http.Error(w, "Secret not found", http.StatusNotFound)
		return
	}

	valid := totp.Validate(req.Token, secret)
	utils.WriteJSON(w, VerifyResponse{Valid: valid})
}
