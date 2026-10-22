import json
from dataclasses import dataclass
from typing import Dict, List

# 1. Import các schema và hàm từ service của bạn
from app.schemas.mbti_submission import AnswerIn
from app.services.mbti_scoring_service import calculate_mbti_result


# 2. Giả lập (Mock) cấu trúc Class Model của DB mà không cần gọi Database
@dataclass
class MockDimension:
    code: str
    left_code: str
    right_code: str


@dataclass
class MockQuestion:
    id: int
    content: str
    weights: Dict[str, float]


def run_test():
    print("=" * 60)
    print("CHẠY THỬ NGHIỆM TÍNH ĐIỂM MBTI VỚI SCORING_SERVICE")
    print("=" * 60)

    # -------------------------------------------------------------
    # A. TẠO DỮ LIỆU GIẢ LẬP: 4 Trục tính cách
    # -------------------------------------------------------------
    dimensions = [
        MockDimension(code="EI", left_code="I", right_code="E"),
        MockDimension(code="SN", left_code="S", right_code="N"),
        MockDimension(code="TF", left_code="T", right_code="F"),
        MockDimension(code="JP", left_code="J", right_code="P"),
    ]

    # -------------------------------------------------------------
    # B. TẠO DỮ LIỆU GIẢ LẬP: 8 Câu hỏi mẫu (2 câu/trục)
    # -------------------------------------------------------------
    questions = [
        # Trục EI
        MockQuestion(
            id=1,
            content="Bạn thích dự tiệc đông người.",
            weights={"EI": 1.0},
        ),
        MockQuestion(
            id=2,
            content="Bạn thích nạp lại năng lượng một mình.",
            weights={"EI": -1.2},
        ),
        # Trục SN
        MockQuestion(
            id=3,
            content="Bạn tập trung vào chi tiết và thực tế hiện tại.",
            weights={"SN": -1.0},
        ),
        MockQuestion(
            id=4,
            content="Bạn hay suy nghĩ về các khả năng trong tương lai.",
            weights={"SN": 1.1},
        ),
        # Trục TF
        MockQuestion(
            id=5,
            content="Bạn ra quyết định dựa trên logic khách quan.",
            weights={"TF": -1.0},
        ),
        MockQuestion(
            id=6,
            content="Bạn ưu tiên cảm xúc của người khác khi đưa ra quyết định.",
            weights={"TF": 1.2},
        ),
        # Trục JP
        MockQuestion(
            id=7,
            content="Bạn thích lập kế hoạch chi tiết trước khi hành động.",
            weights={"JP": -1.0},
        ),
        MockQuestion(
            id=8,
            content="Bạn thích làm việc ngẫu hứng và linh hoạt.",
            weights={"JP": 1.0},
        ),
    ]

    # -------------------------------------------------------------
    # C. GIẢ LẬP CÂU TRẢ LỜI CỦA USER (-2: Rất KHÔNG đồng ý -> +2: Rất đồng ý)
    # Kịch bản mong đợi: Thiên hướng INTJ (I, N, T, J)
    # -------------------------------------------------------------
    user_answers = [
        AnswerIn(question_id=1, value=-2),  # Không thích tiệc -> Nghiêng I
        AnswerIn(question_id=2, value=2),   # Thích ở một mình -> Nghiêng I
        AnswerIn(question_id=3, value=-1),  # Ít tập trung hiện tại -> Nghiêng N
        AnswerIn(question_id=4, value=2),   # Hay nghĩ tương lai -> Nghiêng N
        AnswerIn(question_id=5, value=2),   # Ra quyết định bằng logic -> Nghiêng T
        AnswerIn(question_id=6, value=-2),  # Không ưu tiên cảm xúc -> Nghiêng T
        AnswerIn(question_id=7, value=2),   # Lập kế hoạch kỹ -> Nghiêng J
        AnswerIn(question_id=8, value=-1),  # Ít ngẫu hứng -> Nghiêng J
    ]

    # -------------------------------------------------------------
    # D. GỌI HÀM TÍNH TOÁN
    # -------------------------------------------------------------
    result = calculate_mbti_result(
        answers=user_answers,
        questions=questions,
        dimensions=dimensions,
    )

    # -------------------------------------------------------------
    # E. IN KẾT QUẢ OUT
    # -------------------------------------------------------------
    print("\n[KẾT QUẢ MBTI]:", result["personality_code"])
    print("[TÊN NHÓM]:", result["title"])
    print("[ĐỘ TIN CẬY]:", f"{result['validity_score']}%")
    print("\n[CHI TIẾT PHẦN TRĂM CÁC TRỤC]:")
    print(json.dumps(result["spectrum"], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_test()