
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

import app.models  
from app.config import settings
from app.database import Base, engine


def create_database() -> None:
    url = make_url(settings.database_url)
    db_name = url.database

    admin_engine = create_engine(
        url.set(database="postgres"), isolation_level="AUTOCOMMIT"
    )
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"),
            {"name": db_name},
        ).scalar()
        if exists:
            print(f'Database "{db_name}" already exists.')
        else:
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
            print(f'Created database "{db_name}".')
    admin_engine.dispose()


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    print("Tables created (existing ones left untouched).")


if __name__ == "__main__":
    create_database()
    create_tables()
