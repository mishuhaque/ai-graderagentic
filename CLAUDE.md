# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Grader** is a full-stack web app for automated grading of student submissions using Claude AI. Faculty upload PDFs (essays, MCQ, code, math), the app grades them with AI, and outputs Excel/CSV reports.

**Current Status:** Phase 1 complete (auth working). Phases 2-6 planned per `/CLAUDE/plans/hello-lexical-pearl.md`.

## Tech Stack

- **Backend:** FastAPI (async), SQLAlchemy 2.x (async ORM), PostgreSQL
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, TanStack Query
- **Auth:** JWT (argon2 password hashing)
- **AI:** Claude Opus 4.7 (Anthropic SDK, Files API, prompt caching)
- **PDF:** pdfplumber (text extraction), pypdfium2 (rasterization)
- **Reports:** openpyxl (Excel generation)
- **Infra:** Docker Compose (local dev), PostgreSQL, no Redis yet

## Architecture

### Backend (FastAPI)

**Entry point:** `backend/src/ai_grader/main.py`

Key modules:
- `domain/user.py` — SQLAlchemy User model
- `database.py` — async session management, Base declarative
- `main.py` — FastAPI app, lifespan, CORS, auth routes (register/login/me)

**Auth flow:**
1. POST `/auth/register` → hash password with argon2, insert User, return user data
2. POST `/auth/jwt/login` → verify password, generate JWT (sub=user_id), return token
3. GET `/me` (Bearer token) → parse auth header, decode JWT, return User data

Database is created on startup via SQLAlchemy metadata in lifespan context manager.

### Frontend (React)

**Entry point:** `frontend/src/main.tsx` → App.tsx → routing

Key modules:
- `auth/AuthContext.tsx` — JWT state management, login/register/logout, axios interceptor
- `auth/ProtectedRoute.tsx` — guards dashboard, redirects to login if no token
- `pages/Login.tsx, Register.tsx, Dashboard.tsx` — UI

Auth persists JWT in localStorage; axios client adds Bearer token to all requests.

### Database

Single migration in `backend/alembic/versions/001_initial_user_table.py` creates `user` table. Run via:
```bash
cd backend && alembic upgrade head
```
(Docker Compose auto-creates tables via FastAPI lifespan; manual Alembic for CI/prod.)

## Common Commands

### Backend (local development)

```bash
cd backend

# Install deps
pip install -e ".[dev]"

# Run migrations (dev uses lifespan auto-create; this is for explicit control)
alembic upgrade head

# Dev server with auto-reload
uvicorn ai_grader.main:app --reload

# Run tests
pytest

# Linting
ruff check .
mypy .
```

### Frontend (local development)

```bash
cd frontend

# Install deps
npm install

# Dev server (hot-reload on port 5173)
npm run dev

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test

# E2E (Playwright)
npm run e2e
```

### Docker (full stack)

```bash
# Build and start (PostgreSQL, FastAPI, Vite)
docker-compose up --build

# Clean rebuild
docker-compose down -v && docker-compose up --build

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Run shell in container
docker-compose exec api bash
```

## SDLC Phases (from plan)

| Phase | Status | Deliverable |
|-------|--------|-------------|
| 1 | ✓ Done | Auth (register/login), Docker scaffold, DB setup |
| 2 | Planned | Classes, Assignments, Rubrics, PDF upload + triage |
| 3 | Planned | Claude grading (prompt caching, structured outputs, async fan-out) |
| 4 | Planned | Excel/CSV reports, download endpoint |
| 5 | Planned | Rubric library, manual overrides, cost dashboard |
| 6 | Planned | Production Docker, docs |

See `.claude/plans/hello-lexical-pearl.md` for full details (architecture, tech choices, risk mitigation, verification steps).

## Critical Files & Design Decisions

### Auth Flow (Phase 1)
- **File:** `backend/src/ai_grader/main.py` (routes), `frontend/src/auth/AuthContext.tsx` (state)
- **Why JWT + argon2:** Stateless, no session table needed; argon2 has no password-length limit (vs bcrypt's 72-byte constraint)
- **Why Bearer token in Authorization header:** Standard REST pattern, works with axios interceptors
- **Token stored in localStorage:** Simple for SPA; XSS risk mitigated by Content-Security-Policy (not yet implemented)

### Database (Phase 1)
- **File:** `backend/src/ai_grader/database.py` (session setup), `domain/user.py` (User model)
- **Why async SQLAlchemy:** FastAPI is async; async ORM avoids thread pool blocking
- **Why Alembic:** Version control for schema changes; though Phase 1 uses lifespan auto-create for dev speed

### Phase 2+ Architecture (from plan)
- **Classes/Assignments/Rubrics:** Domain models in `domain/`, API routers in `api/` (yet to be created)
- **PDF ingest:** `pdf/triage.py` (typed vs scanned detection), `pdf/extract.py` (pdfplumber), `pdf/rasterize.py` (pypdfium2)
- **AI grading:** `grading/claude_client.py` (Anthropic SDK wrapper + caching), `grading/pipeline.py` (async fan-out + semaphore), `grading/prompts/` (per-type templates)
- **Reports:** `reports/excel.py` (openpyxl), `reports/csv_writer.py`
- **Caching strategy:** Rubric + examples in system prompt (first 3 blocks) marked with `cache_control`; student 1 writes cache, students 2-50 read at ~10% cost

## Environment Setup

Copy `.env.example` to `.env` and set:
- `ANTHROPIC_API_KEY` — required for Phase 3+ grading
- `JWT_SECRET` — secure random string for token signing
- `DATABASE_URL` — PostgreSQL connection (docker-compose sets default)

## Testing Strategy

- **Unit tests:** `backend/tests/unit/` (prompt snapshots, rubric validation, etc.)
- **Integration tests:** `backend/tests/integration/` (FastAPI TestClient + mocked Claude)
- **E2E live Claude:** `backend/tests/e2e/` (gated by `RUN_LIVE_E2E=1`; verifies cache hit rates)
- **Frontend E2E:** `frontend/tests/e2e/` (Playwright; happy-path register → grade → download)

## Notes for Future Work

- **Phase 2 blocker:** Rubric editor UI (allows faculty to define criteria JSON). Consider form library (react-hook-form + zod already in stack).
- **Phase 3 risk:** Code grading reliability. Plan includes sandbox execution + `effort: xhigh` thinking mode + manual review flag.
- **Deployment:** docker-compose.yml works locally; for prod, use cloud (AWS/GCP) or on-prem (Kubernetes recommended for async scaling).
- **Performance:** Async semaphore (default 5) bounds concurrency on 50 PDFs; watch ITPM rate limits (cached reads count at ~10%).
