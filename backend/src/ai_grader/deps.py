from fastapi_users import FastAPIUsers
from fastapi_users.authentication import JWTStrategy
import uuid

from ai_grader.config import settings
from ai_grader.domain.user import User, UserRead, UserCreate, UserUpdate, get_user_db

jwt_strategy = JWTStrategy(
    secret=settings.jwt_secret,
    lifetime_seconds=settings.jwt_expiration_hours * 3600,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_db,
    [jwt_strategy],
)

current_active_user = fastapi_users.current_user(active=True)
optional_user = fastapi_users.current_user(active=True, optional=True)
