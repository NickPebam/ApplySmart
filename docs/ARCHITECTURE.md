# Architecture – ApplySmart

## Overview

ApplySmart uses a modular service-based architecture where each service is responsible for a specific domain.

The architecture separates authentication, AI processing, and frontend interaction to keep the system scalable and maintainable.

---

# Services

## 1. Authentication Service

Location
```
applysmart-spring/auth_service
```

Technology
* Java 17
* Spring Boot
* Spring Security
* JWT
* MySQL (Railway managed)
* Brevo API (transactional email)

Responsibilities
* User registration with OTP email verification
* 2FA on every login — fresh OTP required
* JWT access and refresh token generation
* Token validation endpoint for Node.js service
* Auto-deletion of unverified accounts after 24 hours
* Role-based access control

---

## 2. AI Application Service

Location
```
applysmart-node
```

Technology
* Node.js
* Express
* MongoDB Atlas
* Gemini AI
* Socket.IO
* Node-Cron

Responsibilities
* Resume upload and parsing (memory-based, no disk storage)
* Job description storage
* Resume vs job description AI analysis
* ATS score generation
* Cover letter generation
* Follow-up email generation
* Application tracking with analysis history
* Real-time notifications via Socket.IO
* Automated follow-up reminders via Node-Cron

---

## 3. Frontend Application

Location
```
applysmart-frontend
```

Technology
* React
* Vite
* Axios
* Context API
* Socket.IO Client

Responsibilities
* User authentication interface (register, OTP verify, login, 2FA)
* Resume upload interface
* AI analysis dashboard with ATS score visualization
* Application tracker with expandable analysis per application
* Real-time notification system

---

# High-Level Flow

1. User registers via Spring Boot — OTP sent via Brevo API
2. User verifies OTP — JWT issued
3. On every login, credentials verified then fresh OTP sent and verified before JWT issued
4. Frontend stores JWT in localStorage
5. Frontend calls Node.js AI service with JWT in Authorization header
6. Node.js validates JWT by calling Spring Boot /api/auth/validate
7. Resume file uploaded — parsed in memory (no disk), text stored in MongoDB Atlas
8. Gemini AI analyzes resume vs job description
9. Analysis result, ATS score, cover letter, follow-up email saved to MongoDB
10. Socket.IO delivers real-time notifications

---

# Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://applysmart-ashy.vercel.app |
| Spring Boot | Railway | https://applysmart-production-c3b2.up.railway.app |
| Node.js | Railway | https://applysmart-production.up.railway.app |
| MySQL | Railway | Managed MySQL plugin |
| MongoDB | MongoDB Atlas | Free M0 cluster |
| Email | Brevo | HTTP API, 300 emails/day free |

---

# Future Improvements

* Docker containerization
* CI/CD pipeline automation
* Cloud file storage for resume downloads
* Message queue communication between services
* AI-powered resume optimization engine