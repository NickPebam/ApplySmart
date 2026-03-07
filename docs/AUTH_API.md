# Authentication API

Base URL (Production)
```
https://applysmart-production-c3b2.up.railway.app/api/auth
```

Base URL (Local)
```
http://localhost:8081/api/auth
```

---

# Register User

POST `/register`

Saves user as unverified and sends a 6-digit OTP to the provided email.
If the email exists but is unverified, the old record is deleted and a fresh OTP is sent.

Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9874216727",
  "password": "password123"
}
```

Response
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

---

# Verify Email (Registration OTP)

POST `/verify-email`

Verifies the OTP sent during registration. Returns JWT on success.

Request
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response
```json
{
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

---

# Login (Step 1)

POST `/login`

Validates credentials and sends a fresh OTP to the user's email.
No JWT is returned at this step.

Request
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response
```
200 OK (no body)
```

---

# Login (Step 2 — Verify OTP)

POST `/login-verify`

Verifies the OTP sent during login. Returns JWT on success.

Request
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response
```json
{
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

---

# Resend OTP

POST `/send-otp?email=john@example.com`

Resends OTP. Works for both unverified (registration) and verified (login 2FA) users.

Response
```
200 OK (no body)
```

---

# Refresh Token

POST `/refresh`

Request
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response
```json
{
  "token": "new-jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

---

# Validate Token

POST `/validate`

Used internally by Node.js service to validate JWT tokens.

Headers
```
Authorization: Bearer <token>
```

Response
```json
{
  "valid": true,
  "userId": 1,
  "email": "john@example.com",
  "role": "USER"
}
```

---

# Logout

POST `/logout`

Headers
```
Authorization: Bearer <token>
```

Response
```
200 OK
```

---

# Health Check

GET `/health`

Response
```json
{
  "status": "OK"
}
```

---

# Swagger Documentation

```
https://applysmart-production-c3b2.up.railway.app/swagger-ui/index.html
```

---

# Notes

* OTP expires after 10 minutes
* Unverified accounts are automatically deleted after 24 hours
* 2FA is required on every login — a fresh OTP is sent each time