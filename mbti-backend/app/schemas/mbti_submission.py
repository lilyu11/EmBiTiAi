from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel, ConfigDict, Field


class AnswerIn(BaseModel):
    """Schema câu trả lời đơn lẻ của client."""
    question_id: int
    value: int = Field(
        ...,
        ge=-2,
        le=2,
        description="Thang đo Likert: -2 (Rất sai), -1 (Sai), 0 (Bình thường), 1 (Đúng), 2 (Rất đúng)"
    )


class SubmissionCreate(BaseModel):
    """Payload gửi lên khi client nộp bài test."""
    test_id: str
    answers: List[AnswerIn] = Field(..., min_length=1)


class AxisDetail(BaseModel):
    """Schema thông tin chi tiết của 1 trục tính cách."""
    left_code: str
    right_code: str
    left_percentage: float
    right_percentage: float
    dominant: str


class ResultOut(BaseModel):
    """Schema kết quả phân tích MBTI hoàn chỉnh."""
    submission_id: str
    personality_code: str
    title: str
    validity_score: float
    spectrum: Dict[str, AxisDetail]
    strengths: List[str]
    weaknesses: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmissionResponse(BaseModel):
    submission_id: str
    message: str
    result: ResultOut
