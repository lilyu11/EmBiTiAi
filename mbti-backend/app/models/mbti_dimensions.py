import uuid
from datetime import datetime
from sqlalchemy import JSON, Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


class MBTI_Dimension(Base):
	"""Bảng lưu trữ 4 trục phổ tính cách (IE, SN, TF, JP)"""

	__tablename__ = "mbti_dimensions"

	id = Column(Integer, primary_key=True, index=True)
	test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)
	code = Column(String(10), nullable=False)        # 'IE', 'SN', 'TF', 'JP'
	left_code = Column(String(5), nullable=False)    # 'I', 'S', 'T', 'J'
	right_code = Column(String(5), nullable=False)   # 'E', 'N', 'F', 'P'
	name = Column(String(100), nullable=False)

	# Relationships
	tests = relationship("Test", back_populates="mbti_dimensions")