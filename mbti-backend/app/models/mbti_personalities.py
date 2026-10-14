from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class MBTIPersonality(Base):
	__tablename__ = "mbti_personalities"

	id = Column(Integer, primary_key=True, index=True)
	personality_code = Column(String(10), unique=True, index=True, nullable=False)    # e.g. 'INTJ-A'
	base_code = Column(String(5), index=True, nullable=False)                         # e.g. 'INTJ'
	identity_variant = Column(String(20), nullable=False)                             # 'Assertive' | 'Turbulent'
	title = Column(String(100), nullable=False)                                       # e.g. 'Kiến trúc sư'
	modules = Column(JSON, nullable=False)                                            # personality traits, career paths, personal growth, relationships
	created_at = Column(DateTime(timezone=True), server_default=func.now())