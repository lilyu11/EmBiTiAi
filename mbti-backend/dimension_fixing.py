from app.core.database import SessionLocal
from app.models.mbti_dimensions import MBTI_Dimension
from app.models.tests import Test
from app.models.submissions import Submission
from app.models.questions import Question


def fix_and_seed_dimensions():
    db = SessionLocal()
    try:
        # 1. Kiểm tra số lượng bản ghi hiện có
        count = db.query(MBTI_Dimension).count()
        print(f"🔍 Số bản ghi hiện có trong bảng MBTI_Dimension: {count}")

        # 2. Nếu đã có dữ liệu nhưng test_id bị lệch, cập nhật toàn bộ về test_id = 1
        if count > 0:
            db.query(MBTI_Dimension).update({MBTI_Dimension.test_id: 1})
            db.commit()
            print("✅ Đã cập nhật toàn bộ test_id trong MBTI_Dimension về 1!")
            return

        # 3. Nếu bảng đang rỗng (count = 0), tiến hành chèn mới 4 trục
        print("🚀 Bảng đang rỗng. Tiến hành chèn 4 trục MBTI...")
        dimensions_data = [
            {"test_id": 1, "code": "EI", "left_code": "I", "right_code": "E", "name": "Xu hướng Năng lượng"},
            {"test_id": 1, "code": "SN", "left_code": "S", "right_code": "N", "name": "Nhận thức Thế giới"},
            {"test_id": 1, "code": "TF", "left_code": "T", "right_code": "F", "name": "Quyết định & Lựa chọn"},
            {"test_id": 1, "code": "JP", "left_code": "J", "right_code": "P", "name": "Cách thức Hành động"},
        ]

        for item in dimensions_data:
            dim = MBTI_Dimension(**item)
            db.add(dim)

        db.commit()
        print("✅ Đã nạp thành công 4 trục MBTI_Dimension vào CSDL!")

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi trong quá trình nạp dữ liệu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_and_seed_dimensions()