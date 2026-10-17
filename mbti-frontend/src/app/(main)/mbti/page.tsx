'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/mbti';
import { mbtiApi } from '@/lib/api/mbti';
import { Loader2, AlertCircle, ArrowRight, RotateCcw, SlidersHorizontal, Clock, ArrowLeft } from 'lucide-react';

const LIKERT_OPTIONS = [
	{ label: 'Rất không đồng ý', value: -2, short: 'Rất không đồng ý' },
	{ label: 'Không đồng ý', value: -1, short: 'Không đồng ý' },
	{ label: 'Trung lập', value: 0, short: 'Trung lập' },
	{ label: 'Đồng ý', value: 1, short: 'Đồng ý' },
	{ label: 'Rất đồng ý', value: 2, short: 'Rất đồng ý' },
];

const QUESTION_LIMIT_OPTIONS: Array<{ count: number | 'all'; title: string; time: string; desc: string }> = [
	{ count: 20, title: '20 Câu hỏi', time: '~4 phút', desc: 'Trắc nghiệm nhanh, nắm bắt xu hướng cốt lõi.' },
	{ count: 40, title: '40 Câu hỏi', time: '~8 phút', desc: 'Độ dài tiêu chuẩn, cân bằng độ chính xác.' },
	{ count: 60, title: '60 Câu hỏi', time: '~12 phút', desc: 'Phân tích chi tiết và sâu sắc các trục nhận thức.' },
	{ count: 'all', title: 'Tất cả câu hỏi', time: '~15 phút', desc: 'Độ chính xác cao với tất cả câu hỏi hệ thống.' },
];

export default function MBTITestPage() {
	const [allQuestions, setAllQuestions] = useState<Question[]>([]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [selectedLimit, setSelectedLimit] = useState<number | null>(null);
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
			setAllQuestions(data);
		} catch (err: any) {
			setError('Không thể tải danh sách câu hỏi từ máy chủ. Vui lòng thử lại.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, []);

	const handleStartWithLimit = (limit: number | 'all') => {
		const count = limit === 'all' ? allQuestions.length : Number(limit);

		// Phân loại câu hỏi theo trục tính cách chính để đảm bảo phân tầng (stratified sampling) đầy đủ các trục
		const axisMap: Record<string, Question[]> = {};
		allQuestions.forEach((q) => {
			const axes = Object.keys(q.weights || {});
			if (axes.length === 0) {
				if (!axisMap['OTHER']) axisMap['OTHER'] = [];
				axisMap['OTHER'].push(q);
			} else {
				// Chọn trục có trọng số tuyệt đối lớn nhất làm trục chính
				let primaryAxis = axes[0];
				let maxWeight = Math.abs(q.weights[primaryAxis] || 0);
				axes.forEach((ax) => {
					const w = Math.abs(q.weights[ax] || 0);
					if (w > maxWeight) {
						maxWeight = w;
						primaryAxis = ax;
					}
				});
				if (!axisMap[primaryAxis]) axisMap[primaryAxis] = [];
				axisMap[primaryAxis].push(q);
			}
		});

		const axes = Object.keys(axisMap);

		// Xáo trộn ngẫu nhiên câu hỏi trong từng trục trước
		axes.forEach((ax) => {
			axisMap[ax].sort(() => Math.random() - 0.5);
		});

		let selected: Question[] = [];

		if (count >= allQuestions.length) {
			// Lấy toàn bộ câu hỏi và xáo trộn ngẫu nhiên
			selected = [...allQuestions].sort(() => Math.random() - 0.5);
		} else {
			// Lấy đều đặn từ mỗi trục để đảm bảo đủ tất cả các giá trị trục
			const perAxisTarget = Math.max(1, Math.floor(count / axes.length));
			const remainingPool: Question[] = [];

			axes.forEach((ax) => {
				const group = axisMap[ax];
				const take = Math.min(group.length, perAxisTarget);
				selected.push(...group.slice(0, take));
				remainingPool.push(...group.slice(take));
			});

			// Bổ sung phần còn lại từ pool chung nếu chưa đủ số lượng
			remainingPool.sort(() => Math.random() - 0.5);
			const needed = count - selected.length;
			if (needed > 0) {
				selected.push(...remainingPool.slice(0, needed));
			} else if (selected.length > count) {
				selected = selected.slice(0, count);
			}

			// Xáo trộn toàn bộ tập câu hỏi đã chọn để đảm bảo tính biến thiên và ngẫu nhiên
			selected.sort(() => Math.random() - 0.5);
		}

		setQuestions(selected);
		setSelectedLimit(selected.length);
		setAnswers({});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleSelectOption = (questionId: number, value: number) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
	};

	const answeredCount = Object.keys(answers).length;
	const remainingCount = questions.length - answeredCount;
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

	if (error && allQuestions.length === 0) {
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
					className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl text-sm transition-all hover:opacity-95 cursor-pointer"
				>
					<RotateCcw className="w-4 h-4" />
					<span>Thử lại</span>
				</button>
			</div>
		);
	}

	if (selectedLimit === null && allQuestions.length > 0) {
		return (
			<div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-300">
				<div className="text-center space-y-3">
					<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
						<SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
						Tùy chọn bài kiểm tra
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
						Chọn số lượng câu hỏi
					</h1>
					<p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
						Lựa chọn quy mô bài trắc nghiệm phù hợp với quỹ thời gian của bạn để bắt đầu.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{QUESTION_LIMIT_OPTIONS.map((opt) => {
						const isAll = opt.count === 'all';
						const actualCount = isAll ? allQuestions.length : Math.min(Number(opt.count), allQuestions.length);

						return (
							<button
								key={String(opt.count)}
								type="button"
								onClick={() => handleStartWithLimit(opt.count)}
								className="text-left bg-card border border-border p-6 rounded-3xl hover:border-primary/50 hover:shadow-sm transition-all space-y-3 group cursor-pointer relative overflow-hidden"
							>
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
										{opt.title}
									</h3>
									<span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-accent px-3 py-1 rounded-full">
										<Clock className="w-3 h-3" />
										{opt.time}
									</span>
								</div>

								<p className="text-xs text-muted-foreground leading-relaxed">
									{opt.desc} ({actualCount} câu hỏi thực tế)
								</p>
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-10 pb-28 relative">


			{/* Header */}
			<div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
				<div className="space-y-1.5 text-center sm:text-left">
					<div className="mb-2">
						<button
							type="button"
							onClick={() => setSelectedLimit(null)}
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-full cursor-pointer"
						>
							<ArrowLeft className="w-3.5 h-3.5" />
							<span>Đổi số câu ({questions.length} câu)</span>
						</button>
					</div>
					<h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
						Bài Trắc Nghiệm MBTI
					</h1>
					<p className="text-muted-foreground text-sm">
						Chọn mức độ phù hợp với mỗi nhận định theo cảm nhận tự nhiên của bạn.
					</p>
				</div>

				{/* Mobile / Inline Circular Counter */}
				<div className="flex xl:hidden items-center gap-4 bg-secondary/50 border border-border px-5 py-3.5 rounded-2xl shrink-0">
					<div className="relative w-12 h-12 flex items-center justify-center">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
							<circle
								cx="24"
								cy="24"
								r="20"
								className="text-border"
								strokeWidth="4"
								stroke="currentColor"
								fill="none"
							/>
							<circle
								cx="24"
								cy="24"
								r="20"
								className="text-primary transition-all duration-500 ease-out"
								strokeWidth="4"
								strokeDasharray="125.6"
								strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100}
								strokeLinecap="round"
								stroke="currentColor"
								fill="none"
							/>
						</svg>
						<span className="absolute text-xs font-extrabold text-foreground">
							{remainingCount}
						</span>
					</div>
					<div className="text-left">
						<div className="text-xs font-bold text-foreground">
							{remainingCount === 0 ? 'Đã hoàn tất!' : `Còn ${remainingCount} câu`}
						</div>
						<div className="text-[11px] text-muted-foreground">
							{answeredCount} / {questions.length} đã trả lời ({progressPercentage}%)
						</div>
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
			<div className="space-y-8" aria-label="Danh sách câu hỏi trắc nghiệm">
				{questions.map((q, index) => {
					const selectedValue = answers[q.id];
					const isAnswered = selectedValue !== undefined;

					return (
						<div
							key={q.id}
							role="group"
							aria-label={`Câu hỏi ${index + 1}`}
							className={`p-6 sm:p-8 border rounded-3xl bg-card transition-all space-y-6 shadow-2xs ${isAnswered
									? 'border-primary/50 ring-1 ring-primary/10 bg-card'
									: 'border-border hover:border-border/80'
								}`}
						>
							<div className="flex items-start gap-4">
								<span className="w-8 h-8 rounded-xl bg-secondary text-secondary-foreground text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
									{index + 1}
								</span>
								<h3 className="font-semibold text-foreground text-base sm:text-lg leading-relaxed m-0 p-0">
									{q.content}
								</h3>
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
											className={`px-3 py-3.5 text-xs font-semibold rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer ${isSelected
													? 'bg-primary text-primary-foreground border-primary shadow-xs scale-[1.02]'
													: 'bg-background border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border'
												}`}
										>
											<span className="leading-tight">{opt.label}</span>
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{/* Sticky Submit Bar with Circular Progress Ring */}
			<div className="sticky bottom-6 z-40 bg-card/95 backdrop-blur-md border border-border p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<div className="relative w-12 h-12 flex items-center justify-center shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
							<circle
								cx="24"
								cy="24"
								r="20"
								className="text-border"
								strokeWidth="4"
								stroke="currentColor"
								fill="none"
							/>
							<circle
								cx="24"
								cy="24"
								r="20"
								className="text-primary transition-all duration-500 ease-out"
								strokeWidth="4"
								strokeDasharray="125.6"
								strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100}
								strokeLinecap="round"
								stroke="currentColor"
								fill="none"
							/>
						</svg>
						<span className="absolute text-xs font-extrabold text-foreground">
							{remainingCount}
						</span>
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
