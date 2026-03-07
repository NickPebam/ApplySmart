# Architecture – ApplySmart

## Overview

ApplySmart uses a **modular service-based architecture** where each service is responsible for a specific domain.

The architecture separates **authentication, AI processing, and frontend interaction** to keep the system scalable and maintainable.

---

# Services

## 1. Authentication Service

Location

```
applysmart-spring
```

Technology

* Spring Boot
* Spring Security
* JWT
* MySQL

Responsibilities

* User registration
* Login and logout
* JWT token generation
* Refresh token management
* Email verification using OTP
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
* MongoDB
* Gemini AI
* Socket.IO
* Node-Cron

Responsibilities

* Resume upload and parsing
* Job description storage
* Resume vs job description analysis
* AI content generation
* Application tracking
* Real-time notifications
* Automated follow-up reminders

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

Responsibilities

* User authentication interface
* Resume upload UI
* AI analysis dashboard
* Application tracker UI
* Notification system
* Display AI-generated results

---

# High-Level Flow

1. User registers or logs in via the **Spring Boot Authentication Service**
2. Frontend receives a **JWT access token**
3. The token is stored securely in the frontend
4. Frontend communicates with the **Node.js AI Service**
5. Resume and job description data are processed
6. Gemini AI generates analysis and recommendations
7. Socket.IO delivers real-time notifications to the user

---

# Future Improvements

Planned architecture improvements include:

* Docker containerization
* CI/CD automation
* Cloud storage for resumes
* Message queue communication between services
* AI-powered resume optimization engine
