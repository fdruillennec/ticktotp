# TickTOTP 🔐

A modern Time-Based One-Time Password (TOTP) generator and verifier with a Go backend API and React frontend.

## Features

- ✨ Generate secure TOTP codes
- ✅ Verify TOTP codes with Redis-backed storage
- 🐳 Full Docker Compose deployment
- 🚀 RESTful API with CORS support
- ⚡ Fast and lightweight Go backend
- 🎨 Modern React frontend

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React      │────▶│   Go API     │────▶│    Redis     │
│   Frontend   │     │   (Port 3000)│     │  (Port 6379) │
│  (Port 8080) │     └──────────────┘     └──────────────┘
└──────────────┘
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Go 1.21+ for local development
- (Optional) Node.js 18+ for frontend development

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/fdruillennec/ticktotp.git
cd ticktotp

# Start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Accessing the Application

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Redis**: localhost:6379

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## API Endpoints

### Generate TOTP
```bash
POST /generate
Content-Type: application/json

{
  "identifier": "user@example.com"
}
```

### Verify TOTP
```bash
POST /verify
Content-Type: application/json

{
  "identifier": "user@example.com",
  "code": "123456"
}
```

### Health Check
```bash
GET /status
```

## Development

### Backend Development (Go)

```bash
cd ticktotp-api

# Install dependencies
go mod download

# Run locally (requires Redis running)
go run main.go

# Run tests
go test ./...

# Build binary
go build -o bin/totp-api
```

### Frontend Development (React)

```bash
cd ticktotp-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
ticktotp/
├── docker-compose.yaml          # Container orchestration
├── ticktotp-api/               # Go backend
│   ├── handlers/               # HTTP request handlers
│   ├── redis/                  # Redis client
│   ├── utils/                  # Utility functions
│   ├── main.go                 # Application entry point
│   ├── go.mod                  # Go dependencies
│   └── Dockerfile              # API container image
└── ticktotp-frontend/          # React frontend
    ├── src/                    # Source files
    ├── public/                 # Static assets
    └── Dockerfile              # Frontend container image
```

## Configuration

### Environment Variables

**API Service:**
- `REDIS_ADDR`: Redis connection address (default: `redis:6379`)
- `PORT`: API server port (default: `3000`)

**Frontend Service:**
- `VITE_API_URL`: Backend API URL (default: `http://totp-api:3000`)

## Security Considerations

- 🔒 TOTP codes expire after 30 seconds
- 🛡️ Redis persistence ensures code validation
- ⚠️ **Production**: Update CORS settings in `main.go` to restrict allowed origins
- 🔐 **Production**: Use environment variables for sensitive configuration
- 🚨 **Production**: Enable HTTPS/TLS for all endpoints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Gin](https://github.com/gin-gonic/gin) web framework
- TOTP implementation using standard libraries
- Redis for persistent storage
- React for modern UI

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/fdruillennec/ticktotp/issues).
