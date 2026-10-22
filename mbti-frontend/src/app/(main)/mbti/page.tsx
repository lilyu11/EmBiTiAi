'use client';

import { useEffect, useState } from 'react';
import { Question, SubmitResponse, ResultOut } from '@/types/mbti';
import { mbtiApi } from '@/lib/api/mbti';

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
			setResponse(res);
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

// COMPONENT HIỂN THỊ KẾT QUẢ BÀI TEST
function ResultView({ result }: { result: ResultOut }) {
	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6 bg-white border rounded-2xl shadow-md my-8">
			<div className="text-center space-y-2">
				<span className="text-sm uppercase tracking-wider text-gray-500">Kết quả MBTI của bạn</span>
				<h1 className="text-4xl font-extrabold text-blue-600">{result.personality_code}</h1>
				<h2 className="text-xl font-medium text-gray-700">{result.title}</h2>
				<p className="text-xs text-gray-400">Độ tin cậy bài làm: {result.validity_score}%</p>
			</div>

			<hr />

			<div className="space-y-5">
				<h3 className="font-semibold text-lg">Tỷ lệ các trục tính cách:</h3>

				{Object.entries(result?.spectrum || {}).map(([axis, data]) => (
					<div key={axis} className="space-y-1">
						<div className="flex justify-between text-sm font-medium">
							<span>{data.left_code} ({data.left_percentage.toFixed(1)}%)</span>
							<span className="font-bold">{axis}</span>
							<span>{data.right_code} ({data.right_percentage.toFixed(1)}%)</span>
						</div>

						<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
							<div
								className="bg-indigo-500 h-full transition-all"
								style={{ width: `${data.left_percentage}%` }}
							/>
							<div
								className="bg-emerald-500 h-full transition-all"
								style={{ width: `${data.right_percentage}%` }}
							/>
						</div>
					</div>
				))}
			</div>

			<button
				type="button"
				onClick={() => window.location.reload()}
				className="w-full py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 font-medium"
			>
				Làm lại bài test
			</button>
		</div>
	);
}