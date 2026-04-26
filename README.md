# AI Grader

An AI-powered web application for automated grading of student submissions using Claude AI. Grades essays, multiple choice, code, and math problems. Generates detailed Excel/CSV reports for faculty.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Anthropic API key

### Setup

1. **Clone and setup environment:**
```bash
cd ai-grader
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

2. **Start the application:**
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### First Steps

1. Register a faculty account at http://localhost:5173/register
2. Login with your credentials
3. Navigate to the dashboard

## Project Structure

```
ai-grader/
├── backend/                    # FastAPI application
│   ├── src/ai_grader/
│   │   ├── main.py            # FastAPI app
│   │   ├── domain/            # SQLAlchemy models
│   │   ├── api/               # API routes
│   │   ├── grading/           # Claude AI grading logic
│   │   ├── pdf/               # PDF processing
│   │   └── reports/           # Report generation
│   ├── tests/                 # Pytest tests
│   └── pyproject.toml
├── frontend/                   # React + TypeScript application
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── auth/              # Authentication
│   │   ├── components/        # Reusable components
│   │   └── api/               # API client
│   └── package.json
├── docker-compose.yml         # Container orchestration
└── docs/                       # Documentation
```

## Development

### Backend

```bash
cd backend
pip install -e ".[dev]"

# Run migrations
alembic upgrade head

# Run tests
pytest

# Run with auto-reload
uvicorn ai_grader.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Backend:** FastAPI with SQLAlchemy async ORM
- **Frontend:** React 18 with TypeScript and Tailwind CSS
- **Database:** PostgreSQL with Alembic migrations
- **AI:** Claude Opus 4.7 with prompt caching and Files API
- **PDF Processing:** pdfplumber for text, pypdfium2 for vision
- **Reports:** openpyxl for Excel generation

## Features (Phases)

### Phase 1 (✓ Done)
- User authentication (register/login)
- Docker setup
- Frontend/backend scaffolding

### Phase 2 (In Progress)
- Class management
- PDF upload & triage
- Assignment/Rubric CRUD

### Phase 3
- Claude AI grading with prompt caching
- Support for essays, MCQ, code, math
- Async processing with progress tracking

### Phase 4
- Excel/CSV report generation
- Download functionality

### Phase 5
- Manual score overrides
- Rubric library & reuse
- Cost dashboard

### Phase 6
- Production Docker config
- Documentation

## Environment Variables

See `.env.example` for all configuration options. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `JWT_SECRET`: Secret for JWT token signing
- `ENVIRONMENT`: `development` or `production`

## Testing

```bash
# Unit & integration tests
pytest

# With coverage
pytest --cov=ai_grader

# E2E with live Claude (gated behind RUN_LIVE_E2E=1)
RUN_LIVE_E2E=1 pytest tests/e2e/

# Frontend tests
npm run test

# E2E browser tests
npm run e2e
```

## Deployment

For local deployment, use the provided `docker-compose.yml`:

```bash
docker-compose up -d
docker-compose logs -f api
```

For production (cloud/on-prem), see `docs/deployment.md`.

## Troubleshooting

**Database connection error:**
```bash
docker-compose down -v
docker-compose up --force-recreate db
```

**API not responding:**
```bash
docker-compose logs api
curl http://localhost:8000/health
```

**Frontend not loading:**
```bash
docker-compose logs frontend
# Check VITE_API_URL environment variable
```

## Contributing

1. Create a feature branch
2. Make changes following the plan in `CLAUDE.md`
3. Run tests and linting
4. Create a pull request

## License

MIT

## Support

For issues, check the `docs/` folder or create an issue in the repository.
