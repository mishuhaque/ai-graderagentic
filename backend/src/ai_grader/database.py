from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from ai_grader.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


async def get_db_session():
    async with async_session_maker() as session:
        yield session
