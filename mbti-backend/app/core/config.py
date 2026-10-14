from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

from sqlalchemy import create_engine
# from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

class Settings(BaseSettings):
	PROJECT_NAME: str = "MBTI"
	API_V1_STR: str = "/api/v1"
	SECRET_KEY: str
	ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

	# Fetch variables
	USER = os.getenv("POSTGRES_USER")
	PASSWORD = os.getenv("POSTGRES_PASSWORD")
	HOST = os.getenv("POSTGRES_SERVER")
	PORT = os.getenv("POSTGRES_PORT")
	DBNAME = os.getenv("POSTGRES_DB")

	# Database
	DATABASE_URL: f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
	REDIS_URL: str

	model_config = SettingsConfigDict(
	env_file=".env",
	env_file_encoding="utf-8",
	case_sensitive=True,
	extra="ignore"
	)

	# # SMTP Config
	# SMTP_HOST: str = "smtp.gmail.com"
	# SMTP_PORT: int = 587
	# SMTP_USER: str = "hadung29112009@gmail.com"
	# SMTP_PASSWORD: str = ""
	# EMAILS_FROM_NAME: str = "AmsClubHub"
	# # Brevo Transactional API Key (https://app.brevo.com/settings/keys/api)
	# BREVO_API_KEY: str = ""
	# # Sender hiển thị, dùng cho Brevo/SMTP (nên là domain ĐÃ XÁC MINH ở Brevo)
	# # Định dạng: "Tên <email@domain-verified.com>". Để trống thì fallback về SMTP.
	# EMAILS_FROM: str = "AmsClubHub <no-reply@amsclubhub.com>"
	# EMAIL_TIMEOUT_SECONDS: float = 10.0

settings = Settings()