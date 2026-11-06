# CLEB — Campus Lab & Equipment Booking

A secure, full-stack booking platform with role-based approvals and a **concurrency-safe booking engine** that cannot double-book a resource — even under simultaneous requests.

Built as a modern rebuild of a Java client-server project, re-architected as a secure web application with the kind of correctness guarantees payment systems depend on.

> **Why this project:** preventing a double-booking under concurrent load is the same class of problem as preventing a double-charge in a payment system. CLEB solves it with a pessimistic database lock inside a transaction — and proves it with a concurrency test.

---

## Security & Reliability Highlights

- **Concurrency-safe booking.** Reservations acquire a pessimistic row lock (`SELECT … FOR UPDATE`) inside a transaction, so two users booking the same resource at the same instant are serialized — one succeeds, the other gets a clean `409 Conflict`. Verified with a parallel-request test.
- **Password security.** Passwords are hashed with **BCrypt** (salted, slow by design) and never stored or returned in plaintext.
- **Stateless JWT authentication.** A custom security filter validates a signed token on every request. No server-side session to steal or scale.
- **Role-based access control (RBAC).** Three roles — `STUDENT`, `TECHNICIAN`, `ADMIN` — enforced server-side on every protected route.
- **Privilege-escalation prevention.** Public sign-ups are always created as `STUDENT`; the server ignores any role supplied by the client. Elevated roles are granted only by an admin.
- **Defense in depth.** The approval workflow is enforced in two independent layers — the HTTP security rules *and* the service logic.
- **No data leakage.** Responses use DTOs, never raw entities, so internal fields like the password hash can never be serialized out.

---

## Features

- **Authentication** — register, log in, JWT-secured sessions.
- **Booking** — students reserve labs and equipment; conflicts are rejected atomically.
- **Two-level approval workflow** — a reservation moves `PENDING_TECH → PENDING_ADMIN → APPROVED` (or `REJECTED`), each transition gated to the right role. Modeled as a state machine.
- **Event-driven notifications** — a new booking notifies technicians and admins; an approval decision notifies the student. In-app bell with unread count.
- **Admin tools** — manage labs and equipment, and promote users to technician or admin.
- **Role-aware UI** — the interface adapts to the signed-in user's role.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js (App Router), TypeScript, Tailwind CSS  |
| Backend   | Spring Boot 3, Java 21                           |
| Security  | Spring Security, JWT (jjwt), BCrypt, RBAC        |
| Database  | PostgreSQL 16 (Spring Data JPA / Hibernate)     |
| Infra     | Docker Compose

The backend is the only tier that touches the database. Every protected request must carry a valid JWT; a filter authenticates it and role rules authorize it before any controller runs. Business logic (booking rules, the approval state machine, the transactional lock) lives in a service layer between the controllers and the repositories.

---

## Running locally

**Prerequisites:** Docker Desktop, Java 21+, Node 18+

```bash
git clone https://github.com/khaidavis/CLEB.git
cd CLEB
cp .env.example .env
docker compose up -d        # PostgreSQL on :5432, Adminer UI on :8081
cd backend && ./mvnw spring-boot:run      # http://localhost:8080
# in a new terminal:
cd frontend && npm install && npm run dev # http://localhost:3000
```

Open **http://localhost:3000**, register an account, and start booking.

---

## Roadmap

- Automated tests (unit + integration), including a test that proves the double-booking lock, run in CI via GitHub Actions.
- Live deployment (managed Postgres + backend, frontend on a CDN host).
- Externalize remaining configuration fully to environment variables.

---

## Author

**Khaliyah Davis** — [@khaidavis](https://github.com/khaidavis)
B.Sc. Computing, University of Technology, Jamaica · Full-Stack Developer | Backend & Security
