FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy application code
COPY src /app/src
COPY alembic.ini .
COPY alembic ./alembic

# Create storage directories
RUN mkdir -p /app/storage/submissions /app/storage/reports

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "ai_grader.main:app", "--host", "0.0.0.0", "--port", "8000"]
