from typing import Dict, List, Any
from app.models.mbti_dimensions import MBTI_Dimension
from app.models.questions import Question
from app.schemas.mbti_submission import AnswerIn, AxisDetail

# Bảng tra cứu tên gọi chuẩn cho 16 nhóm tính cách gốc MBTI
PERSONALITY_TITLES = {
    "INTJ": "Nhà Chiến Lược (Architect)",
    "INTP": "Nhà Tư Duy (Logician)",
    "ENTJ": "Người Chỉ Huy (Commander)",
    "ENTP": "Nhà Tranh Luận (Debater)",
    "INFJ": "Người Khuyên Bảo (Advocate)",
    "INFP": "Người Lý Tưởng Hóa (Mediator)",
    "ENFJ": "Người Cho Đi (Protagonist)",
    "ENFP": "Người Truyền Cảm Hứng (Campaigner)",
    "ISTJ": "Người Trách Nhiệm (Logistician)",
    "ISFJ": "Người Nuôi Dưỡng (Defender)",
    "ESTJ": "Người Giám Sát (Executive)",
    "ESFJ": "Người Quan Tâm (Consul)",
    "ISTP": "Nhà Kỹ Thuật (Virtuoso)",
    "ISFP": "Họa Sĩ (Adventurer)",
    "ESTP": "Người Thực Thần (Entrepreneur)",
    "ESFP": "Người Trình Diễn (Entertainer)",
}


def calculate_validity_score(answers: List[AnswerIn]) -> float:
    """
    Đánh giá độ tin cậy của bài test (0.0 - 100.0%).
    Phát hiện các trường hợp chọn duy nhất 1 đáp án hoặc trả về ngẫu nhiên quá mức.
    """
    if not answers:
        return 0.0

    values = [ans.value for ans in answers]
    total_answers = len(values)
    
    # Kiểm tra tỷ lệ chọn nguyên một đáp án (ví dụ toàn chọn 0 hoặc toàn chọn 2)
    max_freq = max(values.count(v) for v in set(values))
    uniformity_ratio = max_freq / total_answers

    # 80% câu trả lời giống hệt nhau
    if uniformity_ratio >= 0.8:
        return 40.0
    elif uniformity_ratio >= 0.6:
        return 70.0
    
    return 95.0  # Bài làm có độ biến thiên lành mạnh


def calculate_mbti_result(
    answers: List[AnswerIn],
    questions: List[Question],
    dimensions: List[MBTI_Dimension],
) -> Dict[str, Any]:
    """
    Tính toán kết quả MBTI chi tiết từ danh sách câu trả lời của người dùng.
    Hỗ trợ tính toán 5 trục: IE, SN, TF, JP và trục mở rộng AT (Assertive / Turbulent).
    """
    # Khởi tạo map cho các câu hỏi và dimensions
    question_map = {q.id: q for q in questions}
    dim_map = {d.code: d for d in dimensions}

    # Bảng tích lũy điểm thô và điểm tối đa lý thuyết
    raw_scores: Dict[str, float] = {d.code: 0.0 for d in dimensions}
    max_scores: Dict[str, float] = {d.code: 0.0 for d in dimensions}

    # Lặp qua danh sách câu trả lời để cộng dồn trọng số
    for ans in answers:
        question = question_map.get(ans.question_id)
        if not question or not question.weights:
            continue

        for axis_code, weight in question.weights.items():
            if axis_code in raw_scores:
                # Điểm cộng = Value (-2..+2) * Weight
                raw_scores[axis_code] += ans.value * weight
                
                # Điểm tối đa lý thuyết = |Max_Value (2)| * |Weight|
                max_scores[axis_code] += 2.0 * abs(weight)

    # Xử lý chuẩn hóa phần trăm (%) từng trục
    spectrum_result: Dict[str, AxisDetail] = {}
    personality_code_bits: Dict[str, str] = {}

    # Danh sách 4 trục cốt lõi MBTI
    core_axis_order = ["EI", "SN", "TF", "JP"]
    # Tất cả các trục bao gồm cả trục mở rộng AT
    all_axis_order = ["EI", "SN", "TF", "JP", "AT"]

    for code in all_axis_order:
        dim = dim_map.get(code)
        if not dim:
            continue

        raw = raw_scores.get(code, 0.0)
        max_possible = max_scores.get(code, 0.0)

        if max_possible > 0:
            # Quy đổi raw về khoảng [-1.0, +1.0]
            norm_score = max(-1.0, min(1.0, raw / max_possible))

            # Quy đổi norm_score sang tỷ lệ % của Right Code (Cực dương)
            right_pct = round(((norm_score + 1.0) / 2.0) * 100.0, 1)
        else:
            right_pct = 50.0

        left_pct = round(100.0 - right_pct, 1)

        # Xác định thiên hướng vượt trội (Dominant Trait)
        if right_pct >= 50.0:
            dominant = dim.right_code
        else:
            dominant = dim.left_code

        personality_code_bits[code] = dominant

        spectrum_result[code] = AxisDetail(
            left_code=dim.left_code,
            right_code=dim.right_code,
            left_percentage=left_pct,
            right_percentage=right_pct,
            dominant=dominant,
        )

    # Ghép 4 ký tự MBTI cốt lõi
    base_code = "".join(
        personality_code_bits.get(code, "") for code in core_axis_order
    )

    # Xử lý ký tự Identity mở rộng (A/T) từ trục AT
    identity_suffix = personality_code_bits.get("AT", "")
    
    # Tạo mã đầy đủ
    if identity_suffix:
        full_personality_code = f"{base_code}-{identity_suffix}"
    else:
        full_personality_code = base_code

    title = PERSONALITY_TITLES.get(base_code, "Nhóm Tính Cách Chưa Xác Định")
    validity_score = calculate_validity_score(answers)

    return {
        "personality_code": full_personality_code,
        "base_code": base_code,
        "identity_variant": "Assertive" if identity_suffix == "A" else ("Turbulent" if identity_suffix == "T" else "Unknown"),
        "title": title,
        "validity_score": validity_score,
        "spectrum": {k: v.model_dump() for k, v in spectrum_result.items()},
        "summary": f"Bạn thuộc nhóm {full_personality_code} - {title}.",
    }