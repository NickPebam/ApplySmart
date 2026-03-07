# ApplySmart

ApplySmart is an **AI-powered job application assistant** designed to help job seekers improve their application success rate.
It analyzes resumes against job descriptions, generates personalized application content, and tracks job applications in one unified platform.

The project is built using a **modular service-based architecture** combining **Spring Boot, Node.js, and React**.

---

# Project Structure

```
applysmart/

applysmart-spring/       → Authentication Service (Spring Boot)

applysmart-node/         → AI + Application Service (Node.js)

applysmart-frontend/     → Frontend (React)

docs/                    → Architecture & API documentation
```

---

# Phase 1 – Authentication Service

Technology

* Java 17
* Spring Boot
* Spring Security
* JWT Authentication
* Swagger / OpenAPI
* MySQL

Features

* User registration
* Login and logout
* Access + refresh token authentication
* Email verification using OTP
* Role-based access control
* Secure protected endpoints

---

# Phase 2 – AI Application Service

Technology

* Node.js
* Express
* MongoDB
* Gemini AI
* Socket.IO
* Node-Cron

Features

* Resume upload and parsing
* Job description management
* AI resume vs job description analysis
* Cover letter generation
* Follow-up email generation
* Application tracking system
* Real-time notifications
* Automated follow-up reminders

---

# Phase 3 – Frontend (In Progress)

Technology

* React
* Vite
* Axios
* Context API

Features

* User authentication interface
* Resume upload interface
* AI analysis dashboard
* Job application tracker
* AI-generated content display
* Notification system

---

# Key Features

### AI Resume Analysis

Automatically compare resumes with job descriptions and generate an ATS-style match score.

### Cover Letter Generator

Generate tailored cover letters for specific job applications.

### Follow-Up Email Generator

Create professional follow-up emails for recruiters.

### Application Tracker

Track job applications and update their status.

### Smart Notifications

Receive reminders to follow up on job applications.

---

# Security

* JWT authentication
* Refresh token rotation
* Role-based access control
* Secure password hashing
* Environment-based configuration
* Secrets stored using `.env`

---

# Future Roadmap

Planned improvements include:

* Docker containerization
* CI/CD pipeline
* Cloud deployment
* Resume storage using cloud storage
* Message queue for microservice communication
* Advanced AI resume optimization

---

# Documentation

Additional documentation is available in the **docs** folder:

* `architecture.md`
* `auth_api.md`

---

# Status

This project is currently under active development and being built in multiple phases.
