package utils

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
)

func EncodeToBase64(data []byte) string {
	return base64.StdEncoding.EncodeToString(data)
}

func WriteJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
