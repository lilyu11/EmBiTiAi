import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Question(Base):
	"""Bảng lưu câu hỏi tích hợp sẵn ma trận trọng số dạng JSON"""

	__tablename__ = "questions"

	id = Column(Integer, primary_key=True, index=True)
	test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
	content = Column(Text, nullable=False)
	order = Column(Integer, nullable=False, default=0)
	
	# Ma trận trọng số lưu trực tiếp dạng JSON {"EI": 1.0, "TF": -0.5}
	weights = Column(JSON, nullable=False, default=dict)

	# Relationship
	tests = relationship("Test", back_populates="questions")