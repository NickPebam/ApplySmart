# Authentication API – Phase 1

Base URL

```
http://localhost:8080/api/auth
```

---

# Register User

POST `/register`

Request

```
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9874216727",
  "password": "password123"
}
```

Response

```
{
  "message": "User registered successfully"
}
```

---

# Login

POST `/login`

Request

```
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response

```
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

---

# Get Current User

GET `/me`

Headers

```
Authorization: Bearer <accessToken>
```

Response

```
{
  "id": 1,
  "email": "john@example.com",
  "role": "USER"
}
```

---

# Email Verification

POST `/verify-email`

Request

```
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response

```
{
  "message": "Email verified successfully"
}
```

---

# Logout

POST `/logout`

Headers

```
Authorization: Bearer <accessToken>
```

---

# Health Check

GET `/health`

Response

```
{
  "status": "UP"
}
```

---

# Swagger Documentation

Swagger UI

```
http://localhost:8081/swagger-ui/index.html
```

Swagger is the **source of truth** for API contracts.
This file provides a simplified human-readable overview.
