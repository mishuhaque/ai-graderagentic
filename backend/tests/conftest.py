import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from ai_grader.database import Base, get_db_session
from ai_grader.main import app


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def test_db():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_maker = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async def override_get_db():
        async with async_session_maker() as session:
            yield session

    app.dependency_overrides[get_db_session] = override_get_db

    yield engine

    await engine.dispose()


@pytest.fixture
async def test_client(test_db):
    from fastapi.testclient import TestClient

    return TestClient(app)
