# ApplySmart 

ApplySmart is an AI-powered job application assistant that helps users optimize resumes, analyze job descriptions, and manage job applications intelligently.

The project follows a **modular microservice architecture** and is being built in phases.

---

# Project Structure

applysmart/

applysmart-spring/ → Authentication Service (Spring Boot)

applysmart-node/ → AI + Application Service (Node.js)

applysmart-frontend/ → Frontend (React – upcoming)

docs/ → Architecture & API documentation

---

# Phase 1 – Authentication Service 

Technology
- Java 17
- Spring Boot
- Spring Security
- JWT
- Swagger / OpenAPI
- MySQL/PostgreSQL

Features
- User registration
- Login / logout
- JWT authentication
- Role-based access control
- Email verification
- Secure API endpoints

---

# Phase 2 – AI Application Service 

Technology
- Node.js
- Express
- MongoDB
- Gemini AI
- Socket.IO
- Node-Cron

Features
- Resume upload & parsing
- Job description management
- AI resume vs job analysis
- Cover letter generation
- Follow-up email generation
- Application tracking
- Real-time notifications
- Scheduled follow-up reminders

---

# Upcoming Phases

Phase 3 – Frontend
- React
- Dashboard
- Resume upload UI
- Job tracker UI
- Real-time notifications

Phase 4 – Production Deployment
- Docker
- CI/CD
- Cloud deployment

---

# Key Features

AI Resume Analysis  
Automatically compare resumes with job descriptions.

Cover Letter Generator  
Generate personalized cover letters using AI.

Follow-Up Email Generator  
Create professional follow-up emails.

Application Tracker  
Track job applications and statuses.

Smart Notifications  
Receive reminders to follow up on applications.

---

# Security

- JWT authentication
- Role-based access control
- Environment-based configuration
- Secrets stored in `.env`

---

# License

MIT License