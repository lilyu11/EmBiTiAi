'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/mbti';
import { mbtiApi } from '@/lib/api/mbti';
import { Loader2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

const LIKERT_OPTIONS = [
	{ label: 'Rất không đồng ý', value: -2, short: 'Rất không đồng ý' },
	{ label: 'Không đồng ý', value: -1, short: 'Không đồng ý' },
	{ label: 'Trung lập', value: 0, short: 'Trung lập' },
	{ label: 'Đồng ý', value: 1, short: 'Đồng ý' },
	{ label: 'Rất đồng ý', value: 2, short: 'Rất đồng ý' },
];

export default function MBTITestPage() {
	const [questions, setQuestions] = useState<Question[]>([]);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const fetchQuestions = async () => {
		try {
			setLoading(true);
			setError(null);
			const data: Question[] = await mbtiApi.getQuestions();
			setQuestions(data);
		} catch (err: any) {
			setError('Không thể tải danh sách câu hỏi từ máy chủ. Vui lòng thử lại.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, []);

	const handleSelectOption = (questionId: number, value: number) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
	};

	const answeredCount = Object.keys(answers).length;
	const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

	const handleSubmit = async () => {
		if (answeredCount < questions.length) {
			setError(`Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Vui lòng hoàn thành tất cả!`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		setSubmitting(true);
		setError(null);

		try {
			const testId = await mbtiApi.getTestId();
			const payload = {
				test_id: testId,
				answers: questions.map((q) => ({
					question_id: q.id,
					value: answers[q.id],
				})),
			};
			const res = await mbtiApi.submitAnswers(payload);
			const submissionId = res.submission_id || res.result?.submission_id;

			if (submissionId) {
				router.push(`/mbti/result/${submissionId}`);
			} else {
				setError('Không nhận được mã kết quả từ hệ thống.');
			}
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
				<Loader2 className="w-8 h-8 text-primary animate-spin" />
				<p className="text-sm font-medium text-muted-foreground">Đang tải danh sách câu hỏi...</p>
			</div>
		);
	}

	if (error && questions.length === 0) {
		return (
			<div className="max-w-md mx-auto py-16 text-center space-y-6">
				<div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
					<AlertCircle className="w-7 h-7" />
				</div>
				<div className="space-y-2">
					<h2 className="text-xl font-bold text-foreground">Không thể tải bài trắc nghiệm</h2>
					<p className="text-sm text-muted-foreground">{error}</p>
				</div>
				<button
					type="button"
					onClick={fetchQuestions}
					className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl text-sm transition-all hover:opacity-95"
				>
					<RotateCcw className="w-4 h-4" />
					<span>Thử lại</span>
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-10 pb-28">
			{/* Header & Progress */}
			<div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
							Bài Trắc Nghiệm MBTI
						</h1>
						<p className="text-muted-foreground text-sm mt-1">
							Chọn mức độ phù hợp với mỗi nhận định. Hãy chọn theo cảm nhận tự nhiên của bạn.
						</p>
					</div>
					<span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border/80 self-start sm:self-auto">
						Đã trả lời: {answeredCount}/{questions.length}
					</span>
				</div>

				{/* Progress bar */}
				<div className="space-y-2 pt-2">
					<div className="flex justify-between text-xs font-semibold text-muted-foreground">
						<span>Tiến độ hoàn thành</span>
						<span>{progressPercentage}%</span>
					</div>
					<div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-300"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>
			</div>

			{error && (
				<div role="alert" className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3 text-sm">
					<AlertCircle className="w-5 h-5 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			{/* Question Cards with ample spacing */}
			<div className="space-y-10" aria-label="Danh sách câu hỏi trắc nghiệm">
				{questions.map((q, index) => {
					const selectedValue = answers[q.id];
					const isAnswered = selectedValue !== undefined;

					return (
						<fieldset
							key={q.id}
							className={`p-6 sm:p-8 border rounded-3xl bg-card transition-all space-y-6 m-0 shadow-2xs ${
								isAnswered
									? 'border-primary/50 ring-1 ring-primary/10 bg-card'
									: 'border-border hover:border-border/80'
							}`}
						>
							<div className="flex items-start gap-4">
								<span className="w-8 h-8 rounded-xl bg-secondary text-secondary-foreground text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
									{index + 1}
								</span>
								<legend className="font-semibold text-foreground text-base sm:text-lg leading-relaxed float-none p-0">
									{q.content}
								</legend>
							</div>

							{/* Likert Scale Choices */}
							<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2" role="radiogroup" aria-label={`Câu hỏi ${index + 1}`}>
								{LIKERT_OPTIONS.map((opt) => {
									const isSelected = selectedValue === opt.value;
									return (
										<button
											key={opt.value}
											type="button"
											role="radio"
											aria-checked={isSelected}
											onClick={() => handleSelectOption(q.id, opt.value)}
											className={`px-3 py-3.5 text-xs font-semibold rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer ${
												isSelected
													? 'bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]'
													: 'bg-background border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border'
											}`}
										>
											<span className="leading-tight">{opt.label}</span>
										</button>
									);
								})}
							</div>
						</fieldset>
					);
				})}
			</div>

			{/* Sticky Submit Bar */}
			<div className="sticky bottom-6 z-40 bg-card/95 backdrop-blur-md border border-border p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<div className="w-10 h-10 rounded-2xl bg-secondary text-foreground flex items-center justify-center font-bold text-sm border border-border">
						{progressPercentage}%
					</div>
					<div>
						<p className="font-bold text-foreground text-sm">
							{answeredCount === questions.length ? 'Đã hoàn thành toàn bộ câu hỏi!' : `Còn ${questions.length - answeredCount} câu chưa trả lời`}
						</p>
						<p className="text-xs text-muted-foreground">Kiểm tra lại các lựa chọn trước khi nộp bài.</p>
					</div>
				</div>

				<button
					type="button"
					onClick={handleSubmit}
					disabled={submitting}
					className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-2xl hover:opacity-95 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
				>
					{submitting ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							<span>Đang phân tích kết quả...</span>
						</>
					) : (
						<>
							<span>Hoàn thành & Xem kết quả</span>
							<ArrowRight className="w-4 h-4" />
						</>
					)}
				</button>
			</div>
		</div>
	);
}
