from modulefinder import test

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.mbti_dimensions import MBTI_Dimension
from app.models.questions import Question
from app.models.submissions import Submission
from app.models.tests import Test
from app.schemas.mbti_submission import (
	ResultOut,
	SubmissionCreate,
	SubmissionResponse,
)
from app.schemas.mbti_question import QuestionOut
from app.services.mbti_scoring_service import calculate_mbti_result

router = APIRouter(prefix="/mbti", tags=["MBTI"])


@router.get("/questions", response_model=list[QuestionOut])
def get_mbti_questions(db: Session = Depends(get_db)):
	"""Lấy danh sách câu hỏi trắc nghiệm MBTI."""

	test = db.query(Test).filter(Test.slug == "mbti", Test.is_active.is_(True)).first()
	if not test:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Bài test MBTI hiện không tồn tại hoặc đã bị ẩn.",
		)

	questions = (
		db.query(Question)
		.filter(Question.test_id == test.id)
		.order_by(Question.order.asc())
		.all()
	)
	return questions


@router.post("/submit", response_model=SubmissionResponse)
def submit_mbti_test(
	payload: SubmissionCreate,
	db: Session = Depends(get_db),
):
	"""Tiếp nhận câu trả lời của người dùng, tính toán kết quả MBTI và lưu vào database."""

	test = db.query(Test).filter(Test.id == payload.test_id).first()
	if not test:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Không tìm thấy bài test với test_id={payload.test_id}",
		)

	# Truy vấn ngân hàng câu hỏi và trục tính cách liên quan
	questions = db.query(Question).filter(Question.test_id == int(test.id)).all()
	dimensions = db.query(MBTI_Dimension).filter(MBTI_Dimension.test_id == int(test.id)).all()

	# Debugging logs
	print(f"👉 Current Test ID: {test.id}")
	print(f"👉 Found Questions Count: {len(questions)}")
	print(f"👉 Found Dimensions Count: {len(dimensions)}")

	if not questions or not dimensions:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Dữ liệu câu hỏi hoặc cấu trúc trục tính cách chưa được khởi tạo.",
		)

	# Thực hiện tính toán kết quả qua Scoring Service
	calculated_data = calculate_mbti_result(
		answers=payload.answers,
		questions=questions,
		dimensions=dimensions,
	)

	# Lưu lượt làm bài (Submission) vào database
	answers_data = [ans.model_dump() for ans in payload.answers]
	
	submission = Submission(
		test_id=test.id,
		answers_json=answers_data,
		result_json=calculated_data,
	)
	db.add(submission)
	db.commit()
	db.refresh(submission)

	# Ép kiểu dữ liệu sang ResultOut
	result_out = ResultOut(
		submission_id=submission.id,
		personality_code=calculated_data["personality_code"],
		title=calculated_data["title"],
		validity_score=calculated_data["validity_score"],
		spectrum=calculated_data["spectrum"],
		summary=calculated_data["summary"],
		strengths=calculated_data["strengths"],
		weaknesses=calculated_data["weaknesses"],
		created_at=submission.created_at,
	)

	return SubmissionResponse(
		submission_id=submission.id,
		message="Phân tích bài trắc nghiệm MBTI thành công.",
		result=result_out,
	)


@router.get("/result/{submission_id}", response_model=ResultOut)
def get_submission_result(
	submission_id: str,
	db: Session = Depends(get_db),
):
	"""Truy xuất lại kết quả bài test MBTI thông qua UUID lượt làm bài."""
	submission = db.query(Submission).filter(Submission.id == submission_id).first()
	if not submission:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Không tìm thấy kết quả lượt làm bài này.",
		)

	res = submission.result_json
	return ResultOut(
		submission_id=submission.id,
		personality_code=res["personality_code"],
		title=res["title"],
		validity_score=res["validity_score"],
		spectrum=res["spectrum"],
		summary=res["summary"],
		strengths=res["strengths"],
		weaknesses=res["weaknesses"],
		created_at=submission.created_at,
	)