# Platform Foundation

Shared full-stack foundation. Two products are built on top of this same
skeleton: a personal portfolio site, and the Kaliflower ordering/booking system.

Building the foundation once means auth, database setup, containerization and
deployment are solved a single time instead of twice.

---

## Stack

| Layer     | Technology                       | Why |
|-----------|----------------------------------|-----|
| Database  | PostgreSQL 16                    | JSONB for flexible metadata; strong free hosting tiers |
| Backend   | Spring Boot 3 (Java 21)          | Existing strength — effort goes to hard problems, not syntax |
| Security  | Spring Security + JWT, RBAC      | Access/refresh token pattern, role-based route protection |
| Frontend  | Next.js + TypeScript + Tailwind  | Server-side rendering, which matters for a public-facing site |
| Infra     | Docker Compose                   | One command reproduces the whole environment |

---

## Build order

Each layer is proven working before the next one starts.

- [x] **Layer 1 — Infrastructure.** Repo structure, Postgres in Docker, env config
- [ ] **Layer 2 — Backend skeleton.** Spring Boot boots, connects to Postgres, health endpoint responds
- [ ] **Layer 3 — Data model.** Entities, migrations, seed data
- [ ] **Layer 4 — Security.** Registration, login, JWT issue/refresh, RBAC
- [ ] **Layer 5 — Frontend skeleton.** Next.js, API client, auth flow wired up
- [ ] **Layer 6 — Features.** Diverges here: portfolio vs Kaliflower
- [ ] **Layer 7 — Tests + CI.** Unit + integration tests, GitHub Actions
- [ ] **Layer 8 — Deploy.** Live URLs

---

## Getting started

Requires Docker Desktop.

```bash
# 1. Create your local environment file from the template
cp .env.example .env

# 2. Edit .env and set real values.
#    Generate a strong secret with:  openssl rand -base64 48

# 3. Start the stack
docker compose up -d

# 4. Confirm the database is healthy
docker compose ps
```

Then open **http://localhost:8081** for Adminer and sign in with:

| Field    | Value                             |
|----------|-----------------------------------|
| System   | PostgreSQL                        |
| Server   | `db`  ← the container name, not `localhost` |
| Username | whatever you set as `POSTGRES_USER` |
| Password | whatever you set as `POSTGRES_PASSWORD` |
| Database | whatever you set as `POSTGRES_DB`   |

Seeing the database listed means Layer 1 is done.

### Useful commands

```bash
docker compose logs -f db     # follow database logs
docker compose down           # stop, keep data
docker compose down -v        # stop and DELETE all data
docker compose ps             # what is running, and is it healthy
```

---

## Repository layout

```
portfolio-platform/
├── docker-compose.yml    # local stack definition
├── .env.example          # config template (committed)
├── .env                  # real secrets (never committed)
├── .gitignore
├── backend/              # Spring Boot service
├── frontend/             # Next.js application
├── infra/                # deployment config, CI workflows
└── docs/                 # architecture notes, ERD, decision records
```

---

## Conventions

- Secrets live in `.env` only, never in source or in `docker-compose.yml`
- Inside the Docker network, services reach the database at host `db` — not `localhost`
- Every architectural decision gets a short note in `docs/` explaining the *why*
