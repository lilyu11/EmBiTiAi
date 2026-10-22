import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Submission(Base):
	"""Bảng lưu trữ kết quả làm bài test của người dùng"""

	__tablename__ = "submissions"

	id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
	test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
	answers_json = Column(JSON, nullable=False)  # Lưu câu trả lời [{'question_id': 1, 'value': 2}, ...]
	result_json = Column(JSON, nullable=False)   # Lưu kết quả (phân loại, đặc điểm, ...)
	created_at = Column(DateTime, default=datetime.now(), nullable=False)

	# Relationships
	tests = relationship("Test", back_populates="submissions")