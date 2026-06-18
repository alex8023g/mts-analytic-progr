from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base for all ORM models (SQLAlchemy 2.0 style)."""


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a session and always closes it."""
    with SessionLocal() as session:
        yield session
