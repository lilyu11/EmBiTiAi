import json
import os
import sys

# Đảm bảo Python nhận diện đúng thư mục gốc của dự án
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.questions import Question
from app.models.tests import Test
from app.models.mbti_dimensions import MBTI_Dimension
from app.models.submissions import Submission
from app.models.mbti_dimensions import MBTI_Dimension


def import_questions_from_json(
    json_path: str = "mbti_beta_questions.json",
    test_slug: str = "mbti",
) -> int:
    """
    Đọc file JSON chứa ngân hàng câu hỏi và lưu tự động vào database.

    :param json_path: Đường dẫn tới file JSON chứa câu hỏi.
    :param test_slug: Slug định danh bài test (mặc định là 'mbti').
    :return: Số lượng câu hỏi đã import/cập nhật thành công.
    """
    if not os.path.exists(json_path):
        print(f">> [X] File không tồn tại: {json_path}")
        return 0

    # Đọc dữ liệu từ file JSON
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            questions_data = json.load(f)
    except Exception as e:
        print(f">> [X] Lỗi khi đọc file JSON: {e}")
        return 0

    if not isinstance(questions_data, list):
        print(f">> [X] Dữ liệu trong file JSON phải là một mảng (array).")
        return 0

    db: Session = SessionLocal()
    imported_count = 0

    try:
        # Tìm bài test tương ứng trong database (mặc định slug = 'mbti')
        test = db.query(Test).filter(Test.slug == test_slug).first()

        # Nếu chưa có bài test, tạo mới
        if not test:
            print(f">> [X] Không tìm thấy bài test với slug='{test_slug}'. Đang tạo mới...")
            test = Test(
                title="Bài Trắc Nghiệm Tính Cách MBTI",
                slug=test_slug,
                description="Bộ câu hỏi đánh giá 16 nhóm tính cách MBTI.",
                is_active=True,
            )
            db.add(test)
            db.flush()  # Lấy test.id

        # Lặp qua từng câu hỏi trong file JSON
        for item in questions_data:
            order = item.get("order")
            content = item.get("content")
            weights = item.get("weights", {})

            if not content or order is None:
                print(f">> [X] Bỏ qua mục không hợp lệ (thiếu content hoặc order): {item}")
                continue

            # Kiểm tra xem câu hỏi ở vị trí 'order' này đã tồn tại trong bài test chưa
            existing_question = (
                db.query(Question)
                .filter(Question.test_id == test.id, Question.order == order)
                .first()
            )

            if existing_question:
                # Nếu đã có thì cập nhật nội dung và trọng số
                existing_question.content = content
                existing_question.weights = weights
            else:
                # Nếu chưa có thì tạo câu hỏi mới
                new_question = Question(
                    test_id=test.id,
                    order=order,
                    content=content,
                    weights=weights,
                )
                db.add(new_question)

            imported_count += 1

        # Lưu thay đổi vào database
        db.commit()
        print(f" >> [O] Đã lưu/cập nhật thành công {imported_count} câu hỏi vào database!")

    except Exception as err:
        db.rollback()
        print(f" >> [X] Lỗi khi lưu câu hỏi vào database: {err}")
        imported_count = 0
    finally:
        db.close()

    return imported_count


if __name__ == "__main__":
    # Đường dẫn tới file JSON chứa câu hỏi của bạn
    JSON_FILE_PATH = "mbti_beta_questions.json"
    
    print("_" * 60)
    print(f" >> [O] Đang tiến hành import câu hỏi từ '{JSON_FILE_PATH}'...")
    print("_" * 60)
    
    import_questions_from_json(JSON_FILE_PATH)