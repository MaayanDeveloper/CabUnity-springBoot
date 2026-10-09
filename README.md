# 🚕 CabUnity – Ride-Hailing & Carpooling Platform

**CabUnity** is a full-stack platform designed to connect passengers and drivers for ride booking and shared carpooling. The platform features an interactive real-time mapping interface, role-based user management, and a robust, layered backend architecture.

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC):** Dedicated flows and permissions for **Passengers**, **Drivers**, and **Admins**.
* **Ride Lifecycle Management:** Create, accept, update, and track ride statuses from booking to completion.
* **Carpooling & Ride Groups:** Support for shared travel through the `RideGroup` module.
* **Driver Matching & Location Tracking:** Endpoints for driver discovery and continuous location logging (`LocationLog`).
* **Ratings & Feedback:** Built-in review system allowing passengers and drivers to rate experiences.
* **Interactive Map Integration:** Real-time map rendering and pick-up/drop-off point selection using Leaflet.

---

## 🛠️ Tech Stack

### Backend
* **Language & Framework:** Java 17+, Spring Boot
* **Security & Auth:** Spring Security, JSON Web Tokens (JWT)
* **Data Access & ORM:** Spring Data JPA, Hibernate
* **Database:** H2 Database (Embedded / Persistent file storage)
* **Build Tool:** Maven

### Frontend
* **Framework:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS, shadcn/ui
* **Mapping:** Leaflet, React-Leaflet

---

## 📂 Project Structure

```text
CabUnity/
├── Server/CabUnity/          # Spring Boot Backend Service
│   ├── src/main/java/com/example/cabunity/
│   │   ├── controller/      # REST API Controllers (Admin, Driver, Passenger)
│   │   ├── service/         # Business logic & JWT services
│   │   ├── repositories/    # Spring Data JPA repositories
│   │   ├── entities/        # JPA domain models (User, Driver, Ride, etc.)
│   │   └── dto/             # Data Transfer Objects & validation models
│   └── pom.xml              # Maven configuration
│
└── client/                  # Next.js Frontend Application
    ├── app/                 # Next.js App Router (Pages & API routes)
    ├── components/          # Reusable UI components & Leaflet maps
    ├── lib/                 # Utility functions & API client handlers
    └── package.json         # Frontend dependencies & scripts

🚀 Getting Started
Prerequisites
Java JDK (version 17 or higher)

Maven (or use the included mvnw wrapper)

Node.js (v18+) and npm or pnpm

1. Running the Backend
Navigate to the server directory:

Bash
cd Server/CabUnity
Build and run the application:

Bash
./mvnw spring-boot:run
The Spring Boot server will start on http://localhost:8080.

H2 Database Console: http://localhost:8080/h2-console

2. Running the Frontend
Navigate to the client directory:

Bash
cd client
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
The client application will run on http://localhost:3000.

🔒 Security & Authentication
Authentication is handled via stateless JWT tokens.

Users authenticate via /login, receive a token, and attach it as a Bearer token in the Authorization header for protected endpoints.

Controller endpoints are strictly guarded according to the user's role (ROLE_PASSENGER, ROLE_DRIVER, ROLE_ADMIN).
