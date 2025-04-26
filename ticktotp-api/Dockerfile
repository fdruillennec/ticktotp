FROM golang:1.21-alpine

WORKDIR /app

# Download dependencies early for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the app
RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
