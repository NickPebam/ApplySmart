# ApplySmart – Project Roadmap

---

# Phase 1 – Authentication Service ✅ Completed

* User registration with OTP email verification
* Login with 2FA — fresh OTP on every login
* JWT access and refresh token authentication
* Auto-deletion of unverified accounts after 24 hours
* Role-based access control
* Swagger API documentation

Technology
* Java 17, Spring Boot, Spring Security, JWT, MySQL

---

# Phase 2 – AI Application Service ✅ Completed

* Resume upload and parsing (memory-based)
* Job description management
* AI resume vs job description analysis
* ATS-style match scoring
* AI-generated cover letters
* AI-generated follow-up emails
* Application tracking with analysis history
* Real-time notifications via Socket.IO
* Scheduled follow-up reminders via Node-Cron

Technology
* Node.js, Express, MongoDB Atlas, Gemini AI, Socket.IO, Node-Cron

---

# Phase 3 – Frontend Application ✅ Completed

* User authentication UI (register, OTP verify, login, 2FA)
* Resume upload interface
* AI analysis results page with ATS score visualization
* Application tracker with expandable analysis per application
* Real-time notification system
* Dashboard with stats and pipeline overview

Technology
* React, Vite, Axios, Context API, Socket.IO Client

---

# Phase 4 – Deployment ✅ Completed

* Frontend deployed on Vercel
* Spring Boot deployed on Railway with managed MySQL
* Node.js deployed on Railway connected to MongoDB Atlas
* Transactional email via Brevo HTTP API
* Environment-based configuration across all services
* CORS configured for production origins
* Automatic deployment on GitHub push

Live URLs
* Frontend: https://applysmart-ashy.vercel.app
* Spring Boot: https://applysmart-production-c3b2.up.railway.app
* Node.js: https://applysmart-production.up.railway.app

---

# Phase 5 – Advanced AI Features (Planned)

* Resume optimization suggestions
* Keyword gap analysis
* Resume improvement recommendations
* Job match ranking
* AI-powered application strategy suggestions

---

# Phase 6 – Platform Enhancements (Planned)

* Resume version management
* Interview preparation assistant
* Job search analytics dashboard
* Recruiter contact tracking
* Integration with job platforms
* Browser extension for job analysis
* Docker containerization
* CI/CD pipeline

---

# Vision

ApplySmart aims to become a complete AI-powered job search assistant that helps users improve resumes, generate application materials, track job applications, manage follow-ups, and increase job offer success rates.