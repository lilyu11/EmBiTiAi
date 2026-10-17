'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Brain, Compass, Heart, Shield } from 'lucide-react';

export default function HomePage() {
	const router = useRouter();

	const handleStartTest = (testId: string) => {
		localStorage.setItem('test_id', testId);
		router.push('/mbti');
	};

	return (
		<div className="max-w-4xl mx-auto py-8 px-4 space-y-16">
			{/* Hero Section */}
			<div className="text-center space-y-6 max-w-2xl mx-auto">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide">
					<Sparkles className="w-3.5 h-3.5 text-primary" />
					Khoa học tính cách & Thấu hiểu bản thân
				</div>
				<h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15]">
					Khám phá bản chất & tiềm năng của bạn
				</h1>
				<p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
					Bài trắc nghiệm MBTI chuẩn hóa giúp bạn nhìn nhận rõ ràng tư duy, thế mạnh cốt lõi và định hướng phát triển phù hợp nhất.
				</p>

				{/* 4 MBTI Axes Motif */}
				<div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
					<span className="px-3.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">E/I • Năng lượng</span>
					<span className="px-3.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">S/N • Tâm trí</span>
					<span className="px-3.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">T/F • Bản chất</span>
					<span className="px-3.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold text-foreground shadow-2xs">J/P • Chiến thuật</span>
				</div>
			</div>

			{/* Main Test Card */}
			<div className="max-w-xl mx-auto">
				<div className="bg-card border border-border p-8 sm:p-10 rounded-3xl shadow-xs space-y-8 text-left relative">
					<div className="flex items-center justify-between">
						<div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-2xs">
							16P
						</div>
						<span className="px-3.5 py-1 rounded-full bg-accent text-accent-foreground font-semibold text-xs border border-border/80">
							Miễn phí & Không cần đăng nhập
						</span>
					</div>

					<div className="space-y-2">
						<h2 className="text-2xl sm:text-3xl font-bold text-foreground">Bài Trắc Nghiệm MBTI</h2>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Hệ thống đánh giá qua 4 trục nhận thức chính. Trả lời trung thực theo cảm nhận thực tế của bạn để nhận báo cáo phân tích toàn diện.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4 py-3 border-y border-border text-xs font-medium text-muted-foreground">
						<div className="flex items-center gap-2">
							<Compass className="w-4 h-4 text-primary" />
							<span>Thời gian: ~10 phút</span>
						</div>
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-primary" />
							<span>Độ chính xác cao</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => handleStartTest('1')}
						className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-95 transition-all shadow-xs flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
					>
						<span>Bắt đầu làm bài ngay</span>
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
				<div className="bg-card p-6 sm:p-7 rounded-2xl border border-border space-y-3 shadow-2xs">
					<div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
						<Brain className="w-5 h-5 text-primary" />
					</div>
					<h3 className="font-bold text-foreground text-base">Phân tích chuyên sâu</h3>
					<p className="text-xs text-muted-foreground leading-relaxed">
						Biểu đồ phổ tỷ lệ, đặc điểm tư duy và các góc nhìn sâu sắc về nhân cách.
					</p>
				</div>
				<div className="bg-card p-6 sm:p-7 rounded-2xl border border-border space-y-3 shadow-2xs">
					<div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
						<Sparkles className="w-5 h-5 text-primary" />
					</div>
					<h3 className="font-bold text-foreground text-base">Định hướng nghề nghiệp</h3>
					<p className="text-xs text-muted-foreground leading-relaxed">
						Gợi ý nhóm ngành và môi trường làm việc phù hợp với cấu trúc cá nhân.
					</p>
				</div>
				<div className="bg-card p-6 sm:p-7 rounded-2xl border border-border space-y-3 shadow-2xs">
					<div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
						<Heart className="w-5 h-5 text-primary" />
					</div>
					<h3 className="font-bold text-foreground text-base">Phát triển mối quan hệ</h3>
					<p className="text-xs text-muted-foreground leading-relaxed">
						Hiểu rõ cách giao tiếp, kết nối và thấu hiểu những người xung quanh.
					</p>
				</div>
			</div>
		</div>
	);
}
