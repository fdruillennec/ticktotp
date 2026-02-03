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

type (
	GenerateRequest struct {
		Email string `json:"email"`
	}

	VerifyRequest struct {
		Email string `json:"email"`
		Token string `json:"token"`
	}

	TOTPSecretResponse struct {
		Secret  string `json:"secret"`
		OTPAuth string `json:"otpauth_url"`
		QRCode  string `json:"qrcode_base64"`
	}

	VerifyResponse struct {
		Valid bool `json:"valid"`
	}
)

func IsValidEmail(email string) bool {
	regex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return regex.MatchString(email)
}

// StatusHandler checks if email exists in Redis
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Missing email parameter", http.StatusBadRequest)
		return
	}
	if !IsValidEmail(email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	inRedis, err := redis.EmailExists(email)
	if err != nil {
		http.Error(w, "Error checking email existence", http.StatusInternalServerError)
		return
	}

	status := "not found"
	code := http.StatusNotFound
	if inRedis {
		status = "ok"
		code = http.StatusOK
	}

	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}

// GenerateHandler generates and stores a TOTP secret
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

	if err := redis.Client.Set(redis.Ctx, req.Email, secret.Secret(), 0).Err(); err != nil {
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

// VerifyHandler verifies a given TOTP token
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
