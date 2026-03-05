# Architecture – ApplySmart

## Overview

ApplySmart follows a modular service-based architecture.

Each service is responsible for a specific domain and communicates through APIs.

---

## Services

### 1. Authentication Service
Location: applysmart-spring

Technology
- Spring Boot
- Spring Security
- JWT

Responsibilities
- User registration
- Login & logout
- JWT token generation
- Email verification
- Role-based access control

---

### 2. AI Application Service
Location: applysmart-node

Technology
- Node.js
- Express
- MongoDB
- Gemini AI
- Socket.IO
- Node Cron

Responsibilities
- Resume upload and parsing
- Job description management
- AI resume vs job analysis
- Cover letter generation
- Follow-up email generation
- Application tracking
- Real-time notifications
- Scheduled follow-up reminders

---

### 3. Frontend (Upcoming)
Location: applysmart-frontend

Technology
- React
- Vite

Responsibilities
- User dashboard
- Resume upload UI
- Job tracker UI
- Notifications
- Application management

---

## High-Level Flow

1. User authenticates via Spring Boot Auth Service
2. Frontend stores JWT token
3. Frontend interacts with Node.js AI Service
4. Node service processes resumes and job descriptions
5. Gemini AI performs analysis
6. Socket.IO sends real-time notifications

---

## Future Improvements

- Docker deployment
- CI/CD pipeline
- Cloud storage for resumes
- Microservice communication via message queue