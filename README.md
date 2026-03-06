# ApplySmart

ApplySmart is an AI-powered job application assistant that helps users optimize resumes, analyze job descriptions, and manage job applications intelligently.

The platform combines AI analysis, resume management, and application tracking to streamline the job search process.

The project is built using a modular service-based architecture combining Spring Boot, Node.js, and React.

---

# Project Structure

applysmart/

applysmart-spring/ → Authentication Service (Spring Boot)

applysmart-node/ → AI + Application Service (Node.js)

applysmart-frontend/ → Frontend Application (React)

docs/ → Architecture & API documentation

---

# Features

AI Resume Analysis
Automatically compare resumes with job descriptions and generate ATS-style match scores.

Cover Letter Generator
Generate personalized cover letters using AI based on the job description and resume.

Follow-Up Email Generator
Create professional follow-up emails for job applications.

Application Tracker
Track job applications, statuses, and follow-up reminders.

Smart Notifications
Receive reminders for scheduled follow-ups.

Secure Authentication
User authentication with JWT and email verification.

---

# Technology Stack

Frontend

* React
* Vite
* Axios
* Context API

Authentication Service

* Java 17
* Spring Boot
* Spring Security
* JWT Authentication
* MySQL

AI Application Service

* Node.js
* Express
* MongoDB
* Gemini AI
* Socket.IO
* Node-Cron

---

# Architecture Overview

ApplySmart follows a modular service-based architecture.

1. User authenticates via the Spring Boot authentication service.
2. Frontend stores the JWT token.
3. Frontend communicates with the Node.js AI service.
4. AI service processes resumes and job descriptions.
5. Gemini AI generates analysis and content.
6. Real-time updates are delivered using Socket.IO.

Detailed architecture documentation is available in the docs folder.

---

# Deployment

ApplySmart is deployed using cloud platforms with automatic build and deployment.

Frontend

* Hosted on Vercel

Backend Services

* Spring Boot Authentication Service → Railway
* Node.js AI Service → Railway

Deployment is triggered automatically when code is pushed to the main branch on GitHub.

---

# Security

* JWT authentication
* Role-based access control
* Email verification using OTP
* Environment-based configuration
* Sensitive values stored in .env files

---

# Documentation

Additional documentation can be found in the docs directory.

* Architecture documentation
* Authentication API documentation
* Project roadmap

---

# Contributing

Contributions and suggestions are welcome.

Please read CONTRIBUTING.md for development guidelines and workflow.

---

# Status

ApplySmart is currently under active development.

New features and improvements are being added continuously.
