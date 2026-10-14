from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# --------------------------------------------------------------------------- #
# Render (and some providers) may supply postgres:// which SQLAlchemy 2.x
# does not accept; normalise to postgresql://.
# --------------------------------------------------------------------------- #
_raw_url = settings.DATABASE_URL
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = _raw_url

is_postgres = DATABASE_URL.startswith("postgres")
is_local = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL

# SSL: append sslmode=require to the URL for remote Postgres (Supabase / Render).
# psycopg v3 reads libpq-style params from the DSN itself, so embedding in the
# URL is the most reliable approach across both psycopg2 and psycopg v3.
if is_postgres and not is_local and "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

# Tạo SQLAlchemy Engine
engine = create_engine(
	DATABASE_URL,
	# pool_pre_ping=True,         # Tự động kiểm tra và kết nối lại nếu DB bị ngắt
	# pool_size=10,               # Số connection giữ sẵn
	# max_overflow=15,            # Connection vượt trần tạm thời trước khi chờ pool
	# pool_timeout=20,            # Giảm thời gian chờ khi pool cạn (default 30s)
	# pool_recycle=1800,          # Tái tạo connection sau 30 phút - dưới giới hạn idle của Supabase
	)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho tất cả các ORM Models kế thừa
Base = declarative_base()


def get_db() -> Generator:
	# Dependency cung cấp Database Session cho API endpoints
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
