# Security Policy

## Supported Versions

This project is currently in active development. Security updates are provided for the latest version on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in TickTOTP, please report it responsibly.

### How to Report

**Please do NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security issues by:

1. **Email**: Send details to the repository owner via GitHub private message
2. **GitHub Security Advisories**: Use the "Security" tab to privately report a vulnerability

### What to Include

When reporting a vulnerability, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 7 days with assessment and planned fix timeline
- **Resolution**: Varies by severity, typically within 30 days

### Disclosure Policy

- Security issues will be patched before public disclosure
- We will credit reporters in release notes (unless anonymity is requested)
- Public disclosure will happen after a fix is available and deployed

## Security Best Practices

### For Production Deployments

1. **CORS Configuration**
   - Update `main.go` to restrict `AllowedOrigins` to your specific domain(s)
   - Never use `"*"` in production

2. **Environment Variables**
   - Store sensitive configuration in environment variables
   - Never commit `.env` files or secrets to the repository
   - Use secret management tools (e.g., Docker secrets, Kubernetes secrets)

3. **HTTPS/TLS**
   - Always use HTTPS in production
   - Use a reverse proxy (Nginx, Traefik) with valid SSL certificates
   - Enable HSTS headers

4. **Redis Security**
   - Enable Redis authentication with `requirepass`
   - Use Redis ACLs to limit command access
   - Never expose Redis port publicly
   - Enable Redis persistence encryption if available

5. **Rate Limiting**
   - Implement rate limiting on TOTP generation and verification endpoints
   - Protect against brute-force attacks

6. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage
   - Use parameterized queries or ORM to prevent injection

7. **Container Security**
   - Run containers as non-root users
   - Keep base images updated
   - Scan images for vulnerabilities regularly
   - Use minimal base images (e.g., Alpine)

8. **Monitoring and Logging**
   - Log security-relevant events
   - Monitor for suspicious activity
   - Set up alerts for unusual patterns
   - Never log sensitive data (secrets, tokens, passwords)

9. **Dependencies**
   - Regularly update dependencies
   - Use `go mod tidy` and `npm audit`
   - Enable Dependabot or similar tools

10. **TOTP Security**
    - Use cryptographically secure random number generation
    - Enforce proper time synchronization
    - Implement proper secret storage and rotation
    - Consider implementing backup codes

## Known Security Considerations

### Current Implementation

- **CORS is wide open** (`AllowedOrigins: []string{"*"}`) - Must be restricted for production
- **No rate limiting** - Should be added before production deployment
- **No authentication** on API endpoints - Consider adding API keys or OAuth2
- **Redis runs without authentication** - Should enable `requirepass` in production

### Roadmap

Planned security enhancements:
- [ ] Add rate limiting middleware
- [ ] Implement API authentication
- [ ] Add Redis authentication
- [ ] Implement request signing/verification
- [ ] Add comprehensive input validation
- [ ] Security headers middleware
- [ ] Audit logging

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Go Security Best Practices](https://go.dev/doc/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Redis Security](https://redis.io/docs/management/security/)

## Questions?

For general security questions (not vulnerabilities), feel free to open a public issue with the `security` label.
