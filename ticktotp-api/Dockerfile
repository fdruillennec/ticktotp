FROM golang:1.21-alpine as builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o ticktotp-api .

FROM alpine:latest as runtime

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/ticktotp-api .

EXPOSE 8080

CMD ["./ticktotp-api"]
