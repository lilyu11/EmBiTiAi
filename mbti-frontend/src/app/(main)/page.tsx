'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
	const router = useRouter();

	const handleStartTest = (testId: string) => {
		// Lưu test_id vào localStorage
		localStorage.setItem('test_id', testId);

		// Chuyển hướng sang trang làm bài test MBTI
		router.push('/mbti');
	};

	return (
		<div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-8">
			<div className="space-y-3">
				<h1 className="text-4xl font-black text-slate-900 tracking-tight">
					Khám phá bản thân cùng bài test MBTI
				</h1>
				<p className="text-slate-600 max-w-xl mx-auto text-base">
					Hiểu rõ về 16 nhóm tính cách, điểm mạnh và thiên hướng phát triển của bạn.
				</p>
			</div>

			{/* Card chọn bài test */}
			<div className="max-w-md mx-auto">
				<div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-6 text-left">
					<div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
						16P
					</div>
					<div className="space-y-1">
						<h2 className="text-2xl font-bold text-slate-800">Trắc nghiệm MBTI</h2>
						<p className="text-slate-500 text-sm">
							Đánh giá chính xác 4 trục tính cách (E/I, S/N, T/F, J/P).
						</p>
					</div>
					<button
						type="button"
						onClick={() => handleStartTest('1')}
						className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98]"
					>
						Bắt đầu làm bài
					</button>
				</div>
			</div>
		</div>
	);
}