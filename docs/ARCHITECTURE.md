# Architecture – ApplySmart (Phase 1)

## Overview
ApplySmart follows a modular, service-oriented architecture.

In Phase 1, the project contains a single backend service:
- **Authentication Service**

This service is responsible for user authentication, authorization, and token management.

---

## Authentication Service
**Technology**
- Java 17
- Spring Boot
- Spring Security
- JWT
- Maven

**Responsibilities**
- User registration
- Login & logout
- JWT access and refresh token handling
- Role-based access control
- Email verification
- Exposing secure APIs

---

## High-Level Flow
1. Client sends authentication request
2. Spring Security filters validate the request
3. JWT is generated and returned
4. Protected endpoints require valid JWT
5. Swagger/OpenAPI documents all endpoints

---

## Future Phases (Planned)
- Resume analysis service
- AI-powered job matching
- Frontend application
- Deployment with Docker & CI/CD

> This document will evolve as new services are added.