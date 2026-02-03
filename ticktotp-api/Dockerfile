FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

FROM gcr.io/distroless/static:nonroot AS runtime

COPY --from=builder /app/main /

EXPOSE 3000

USER nonroot:nonroot

ENTRYPOINT ["/main"]
