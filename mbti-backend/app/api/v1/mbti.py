from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.mbti_dimensions import MBTI_Dimension
from app.models.mbti_personalities import MBTIPersonality
from app.models.questions import Question
from app.models.submissions import Submission
from app.models.tests import Test
from app.schemas.mbti_question import QuestionOut
from app.schemas.mbti_submission import (
	ResultOut,
	SubmissionCreate,
	SubmissionResponse,
)
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

	# Truy vấn ngân hàng câu hỏi và các trục tính cách liên quan
	questions = db.query(Question).filter(Question.test_id == int(test.id)).all()
	dimensions = db.query(MBTI_Dimension).filter(MBTI_Dimension.test_id == int(test.id)).all()

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

	personality_code = calculated_data["personality_code"]
	base_code = calculated_data.get("base_code", personality_code)

	# Truy vấn thông tin chi tiết bài viết từ bảng mbti_personalities
	personality_detail = (
		db.query(MBTIPersonality)
		.filter(MBTIPersonality.personality_code == personality_code)
		.first()
	)

	# Fallback truy vấn theo base_code (ví dụ INTJ) nếu chưa có bản ghi INTJ-A cụ thể
	if not personality_detail:
		personality_detail = (
			db.query(MBTIPersonality)
			.filter(MBTIPersonality.base_code == base_code)
			.first()
		)

	# Lấy thông tin nội dung tĩnh (modules / title) nếu tồn tại trong CSDL
	title = personality_detail.title if personality_detail else calculated_data["title"]
	modules = personality_detail.modules if personality_detail else None

	# Lưu lượt làm bài (Submission) vào database
	answers_data = [ans.model_dump() for ans in payload.answers]
	
	# Cập nhật thông tin chi tiết vào result_json để truy xuất lại sau này
	calculated_data["title"] = title
	if modules:
		calculated_data["modules"] = modules

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
		personality_code=personality_code,
		base_code=base_code,
		identity_variant=calculated_data.get("identity_variant", "Unknown"),
		title=title,
		validity_score=calculated_data["validity_score"],
		spectrum=calculated_data["spectrum"],
		summary=calculated_data["summary"],
		modules=modules,
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
	print("👉 Total submissions in DB connected by FastAPI:", db.query(Submission).count())
	submission_id = submission_id.strip()
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
		base_code=res.get("base_code", res["personality_code"]),
		identity_variant=res.get("identity_variant", "Unknown"),
		title=res["title"],
		validity_score=res["validity_score"],
		spectrum=res["spectrum"],
		summary=res["summary"],
		modules=res.get("modules"),
		created_at=submission.created_at,
	)