import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


class Test(Base):
	"""Bảng lưu trữ danh sách các bài test"""

	__tablename__ = "tests"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(100), nullable=False)
	slug = Column(String(50), unique=True, nullable=False, index=True)
	description = Column(Text, nullable=True)
	is_active = Column(Boolean, default=True)
	created_at = Column(DateTime, default=datetime.now(), nullable=False)

	# Relationships
	mbti_dimensions = relationship("MBTI_Dimension", back_populates="tests", cascade="all, delete-orphan")
	questions = relationship("Question", back_populates="tests", cascade="all, delete-orphan")
	submissions = relationship("Submission", back_populates="tests")