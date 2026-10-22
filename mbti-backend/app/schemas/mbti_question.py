from typing import Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuestionBase(BaseModel):
	content: str
	order: int = 0


class QuestionCreate(QuestionBase):
	test_id: int
	weights: Dict[str, float] = Field(
		default_factory=dict,
		description="Ma trận trọng số dạng JSON: {'IE': 1.0, 'TF': -0.5}",
	)
    

class QuestionOut(BaseModel):
    """Schema trả về danh sách câu hỏi cho Frontend."""
    id: int
    content: str
    order: int

    model_config = ConfigDict(from_attributes=True)