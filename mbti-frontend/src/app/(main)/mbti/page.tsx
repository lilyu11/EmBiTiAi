'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question, SubmitResponse, ResultOut } from '@/types/mbti';
import { mbtiApi } from '@/lib/api/mbti';
import ResultView from '@/components/mbti/ResultView';

const LIKERT_OPTIONS = [
	{ label: 'Rất không đồng ý', value: -2, color: 'bg-red-500' },
	{ label: 'Không đồng ý', value: -1, color: 'bg-red-300' },
	{ label: 'Trung lập', value: 0, color: 'bg-gray-300' },
	{ label: 'Đồng ý', value: 1, color: 'bg-green-300' },
	{ label: 'Rất đồng ý', value: 2, color: 'bg-green-500' },
];

export default function MBTITestPage() {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [response, setResponse] = useState<SubmitResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	
	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const data: Question[] = await mbtiApi.getQuestions();
				setQuestions(data);
			} catch (err) {
				setError('Không thể tải danh sách câu hỏi từ máy chủ.');
			} finally {
				setLoading(false);
			}
		};
		fetchQuestions();
	}, []);

	const handleSelectOption = (questionId: number, value: number) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
	};

	const handleSubmit = async () => {
		if (Object.keys(answers).length < questions.length) {
			alert('Vui lòng trả lời toàn bộ các câu hỏi trước khi nộp bài!');
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			const payload = {
				test_id: await mbtiApi.getTestId(),
				answers: Object.entries(answers).map(([qId, val]) => ({
					question_id: Number(qId),
					value: val,
				})),
			};
			const res = await mbtiApi.submitAnswers(payload);

			// Lấy submission_id từ response trả về từ backend
			const submissionId = res.submission_id || res.result?.submission_id;

			if (submissionId) {
				// Chuyển hướng sang trang kết quả riêng biệt
				router.push(`/mbti/result/${submissionId}`);
			} else {
				setError('Không nhận được mã kết quả từ hệ thống.');
			}
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Có lỗi xảy ra khi nộp bài.');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="p-8 text-center">Đang tải câu hỏi...</div>;
	if (response) return <ResultView result={response.result} />;

	return (
		<div className="max-w-3xl mx-auto p-6 space-y-8">
			<h1 className="text-2xl font-bold text-center">Bài Trắc Nghiệm Tính Cách MBTI</h1>

			{error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

			<div className="space-y-6">
				{questions.map((q, index) => (
					<div key={q.id} className="p-5 border rounded-xl bg-white shadow-sm space-y-4">
						<p className="font-medium text-lg">
							Câu {index + 1}: {q.content}
						</p>
						<div className="flex justify-between items-center gap-2">
							{LIKERT_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									onClick={() => handleSelectOption(q.id, opt.value)}
									className={`px-3 py-2 text-sm rounded-lg border transition-all ${answers[q.id] === opt.value
										? `${opt.color} text-white font-bold ring-2 ring-offset-1`
										: 'bg-gray-50 hover:bg-gray-100 text-gray-700'
										}`}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>
				))}
			</div>

			<button
				onClick={handleSubmit}
				disabled={submitting}
				className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
			>
				{submitting ? 'Đang tính toán kết quả...' : 'Hoàn thành & Xem kết quả'}
			</button>
		</div>
	);
}