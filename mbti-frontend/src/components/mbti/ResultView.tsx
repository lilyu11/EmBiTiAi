"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	CheckCircle2,
	AlertCircle,
	RotateCcw,
	Sparkles,
	Briefcase,
	UserCheck,
	HeartHandshake,
	ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces
export interface AxisDetail {
	left_code: string;
	right_code: string;
	left_percentage: number;
	right_percentage: number;
	dominant: string;
}

export interface StrengthWeaknessItem {
	title: string;
	description: string;
}

export interface SectionContent {
	overview?: string;
	free_content?: {
		strengths?: StrengthWeaknessItem[];
		weaknesses?: StrengthWeaknessItem[];
	};
	premium_content?: {
		[key: string]: any;
	};
}

export interface ResultOut {
	submission_id: string | number;
	personality_code: string;
	base_code?: string;
	identity_variant?: string;
	title: string;
	validity_score: number;
	spectrum: Record<string, AxisDetail>;
	summary?: string;
	modules?: {
		personality_traits?: SectionContent;
		career_path?: SectionContent;
		personal_growth?: SectionContent;
		relationships?: SectionContent;
	};
	created_at?: string;
}

const AXIS_NAMES: Record<string, { name: string; leftLabel: string; rightLabel: string }> = {
	EI: { name: "Năng lượng", leftLabel: "Hướng ngoại", rightLabel: "Hướng nội" },
	SN: { name: "Tâm trí", leftLabel: "Trực giác", rightLabel: "Quan sát" },
	TF: { name: "Bản chất", leftLabel: "Lý trí", rightLabel: "Cảm xúc" },
	JP: { name: "Chiến thuật", leftLabel: "Nguyên tắc", rightLabel: "Linh hoạt" },
	AT: { name: "Bản sắc", leftLabel: "Quyết đoán", rightLabel: "Cầu tiến" },
};

const getValidityLabel = (score: number) => {
	if (score >= 75) return 'Cao';
	if (score >= 50) return 'Trung bình';
	return 'Thấp';
};

export default function ResultView({ result }: { result: ResultOut }) {
	const [activeTab, setActiveTab] = useState<string>("traits");

	useEffect(() => {
		const sectionIds = ['traits', 'career', 'growth', 'relationships'];
		const observerCallback: IntersectionObserverCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveTab(entry.target.id);
				}
			});
		};

		const observerOptions: IntersectionObserverInit = {
			root: null,
			rootMargin: '-20% 0px -60% 0px',
			threshold: 0,
		};

		const observer = new IntersectionObserver(observerCallback, observerOptions);
		sectionIds.forEach((id) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => {
			observer.disconnect();
		};
	}, []);

	const modules = result.modules || {};
	const traitsModule = modules.personality_traits;
	const careerModule = modules.career_path;
	const growthModule = modules.personal_growth;
	const relationsModule = modules.relationships;

	const scrollToSection = (id: string) => {
		setActiveTab(id);
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const hasTraits = Boolean(traitsModule || result.spectrum);
	const hasCareer = Boolean(careerModule);
	const hasGrowth = Boolean(growthModule);
	const hasRelations = Boolean(relationsModule);

	return (
		<div className="w-full max-w-6xl mx-auto space-y-12 pb-24">
			{/* HEADER BANNER */}
			<div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-xs text-center relative overflow-hidden">
				<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide mb-6">
					<Sparkles className="w-3.5 h-3.5 text-primary" />
					Kết quả phân tích MBTI
				</div>

				<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
					{result.title}
				</h1>
				<div className="inline-block px-4 py-1.5 rounded-2xl bg-secondary text-primary font-black text-xl tracking-wider mb-6 border border-border">
					{result.personality_code}
				</div>

				<p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed mb-6">
					{result.summary || `Bạn thuộc nhóm tính cách ${result.personality_code} - ${result.title}.`}
				</p>

				<div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary/80 px-3.5 py-1.5 rounded-full border border-border">
					<ShieldCheck className="w-4 h-4 text-primary" />
					Độ tin cậy bài làm: <span className="font-bold text-foreground">{getValidityLabel(result.validity_score)}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* MAIN CONTENT */}
				<div className="lg:col-span-8 space-y-10">

					{/* SECTION 1: ĐẶC ĐIỂM TÍNH CÁCH & SPECTRUM */}
					{hasTraits && (
						<section id="traits" className="result-section-anchor bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
							<div className="flex items-center gap-3.5 border-b border-border pb-5">
								<div className="p-3 bg-accent text-primary rounded-2xl">
									<UserCheck className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-foreground">1. Đặc điểm tính cách</h2>
									<p className="text-xs text-muted-foreground">Tỷ lệ các trục năng lượng và tư duy cốt lõi</p>
								</div>
							</div>

							{traitsModule?.overview && (
								<p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
									{traitsModule.overview}
								</p>
							)}

							{/* SPECTRUM BARS */}
							{result.spectrum && Object.keys(result.spectrum).length > 0 && (
								<div className="space-y-6 pt-2">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
										Thang đo tỷ lệ các trục
									</h3>

									<div className="space-y-6">
										{Object.entries(result.spectrum).map(([axisKey, data]) => {
											const meta = AXIS_NAMES[axisKey] || {
												name: axisKey,
												leftLabel: data.left_code,
												rightLabel: data.right_code,
											};

											const leftPct = typeof data.left_percentage === 'number' ? data.left_percentage : 50;
											const rightPct = typeof data.right_percentage === 'number' ? data.right_percentage : 50;

											return (
												<div key={axisKey} className="space-y-2">
													<div className="flex justify-between items-center text-xs sm:text-sm font-medium">
														<span className={cn(data.dominant === data.left_code ? "text-primary font-bold" : "text-muted-foreground")}>
															{leftPct.toFixed(1)}% {meta.leftLabel} ({data.left_code})
														</span>
														<span className="text-xs text-muted-foreground font-semibold px-2.5 py-0.5 bg-secondary rounded-md">
															{meta.name}
														</span>
														<span className={cn(data.dominant === data.right_code ? "text-primary font-bold" : "text-muted-foreground")}>
															({data.right_code}) {meta.rightLabel} {rightPct.toFixed(1)}%
														</span>
													</div>

													{/* Progress bar */}
													<div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex p-0.5 border border-border/60">
														<div
															className="bg-primary/80 h-full rounded-l-full transition-all duration-500"
															style={{ width: `${leftPct}%` }}
														/>
														<div
															className="bg-primary h-full rounded-r-full transition-all duration-500"
															style={{ width: `${rightPct}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</section>
					)}

					{/* SECTION 2: CON ĐƯỜNG SỰ NGHIỆP */}
					{hasCareer && (
						<section id="career" className="result-section-anchor bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
							<div className="flex items-center gap-3.5 border-b border-border pb-5">
								<div className="p-3 bg-accent text-primary rounded-2xl">
									<Briefcase className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-foreground">2. Con đường sự nghiệp</h2>
									<p className="text-xs text-muted-foreground">Môi trường làm việc và thế mạnh nghề nghiệp</p>
								</div>
							</div>

							{careerModule?.overview && (
								<p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
									{careerModule.overview}
								</p>
							)}

							<StrengthWeaknessBlock
								strengths={careerModule?.free_content?.strengths}
								weaknesses={careerModule?.free_content?.weaknesses}
							/>

							<PremiumContentBlock
								title="Top 10 Con đường nghề nghiệp phù hợp"
								items={careerModule?.premium_content?.top_10_career_paths}
							/>
						</section>
					)}

					{/* SECTION 3: SỰ PHÁT TRIỂN CÁ NHÂN */}
					{hasGrowth && (
						<section id="growth" className="result-section-anchor bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
							<div className="flex items-center gap-3.5 border-b border-border pb-5">
								<div className="p-3 bg-accent text-primary rounded-2xl">
									<Sparkles className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-foreground">3. Sự phát triển cá nhân</h2>
									<p className="text-xs text-muted-foreground">Động lực phát triển và rào cản tâm lý</p>
								</div>
							</div>

							{growthModule?.overview && (
								<p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
									{growthModule.overview}
								</p>
							)}

							<StrengthWeaknessBlock
								strengths={growthModule?.free_content?.strengths}
								weaknesses={growthModule?.free_content?.weaknesses}
							/>

							<PremiumContentBlock
								title="Nguồn khai thác năng lượng tự nhiên"
								items={growthModule?.premium_content?.energy_sources}
							/>

							<PremiumContentBlock
								title="Nguyên nhân gây hao hụt năng lượng cần tránh"
								items={growthModule?.premium_content?.energy_drains}
							/>
						</section>
					)}

					{/* SECTION 4: CÁC MỐI QUAN HỆ */}
					{hasRelations && (
						<section id="relationships" className="result-section-anchor bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
							<div className="flex items-center gap-3.5 border-b border-border pb-5">
								<div className="p-3 bg-accent text-primary rounded-2xl">
									<HeartHandshake className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-foreground">4. Các mối quan hệ</h2>
									<p className="text-xs text-muted-foreground">Cách bạn giao tiếp và kết nối tình cảm</p>
								</div>
							</div>

							{relationsModule?.overview && (
								<p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
									{relationsModule.overview}
								</p>
							)}

							<StrengthWeaknessBlock
								strengths={relationsModule?.free_content?.strengths}
								weaknesses={relationsModule?.free_content?.weaknesses}
							/>

							<PremiumContentBlock
								title="Sức mạnh tiềm ẩn trong mối quan hệ"
								items={relationsModule?.premium_content?.relationship_strengths}
							/>

							<PremiumContentBlock
								title="Thói quen rủi ro cần lưu ý"
								items={relationsModule?.premium_content?.relationship_risks}
							/>
						</section>
					)}

					{/* NÚT LÀM LẠI BÀI TEST */}
					<div className="text-center pt-4">
						<Link
							href="/mbti"
							className="inline-flex items-center gap-2 px-7 py-4 bg-primary text-primary-foreground rounded-2xl hover:opacity-95 transition-all font-bold text-sm shadow-xs cursor-pointer"
						>
							<RotateCcw className="w-4 h-4" />
							<span>Làm lại bài kiểm tra MBTI</span>
						</Link>
					</div>
				</div>

				{/* STICKY SIDEBAR */}
				<div className="lg:col-span-4 sticky top-28 space-y-6">
					<div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-6">
						{/* MINI PROFILE */}
						<div className="text-center space-y-2 border-b border-border pb-5">
							<span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
								Loại tính cách của bạn:
							</span>
							<h3 className="text-2xl font-extrabold text-foreground">{result.title}</h3>
							<div className="inline-block px-3.5 py-1 bg-accent text-accent-foreground font-bold text-sm rounded-full border border-border">
								{result.personality_code}
							</div>
						</div>

						{/* MỤC LỤC TRANG */}
						<div className="space-y-1.5">
							<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 block mb-2">
								Nội dung báo cáo
							</span>

							{hasTraits && (
								<NavButton
									id="traits"
									label="1. Đặc điểm tính cách"
									active={activeTab === "traits"}
									onClick={scrollToSection}
								/>
							)}
							{hasCareer && (
								<NavButton
									id="career"
									label="2. Con đường sự nghiệp"
									active={activeTab === "career"}
									onClick={scrollToSection}
								/>
							)}
							{hasGrowth && (
								<NavButton
									id="growth"
									label="3. Sự phát triển cá nhân"
									active={activeTab === "growth"}
									onClick={scrollToSection}
								/>
							)}
							{hasRelations && (
								<NavButton
									id="relationships"
									label="4. Các mối quan hệ"
									active={activeTab === "relationships"}
									onClick={scrollToSection}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// SUB-COMPONENTS

function StrengthWeaknessBlock({
	strengths,
	weaknesses,
}: {
	strengths?: StrengthWeaknessItem[];
	weaknesses?: StrengthWeaknessItem[];
}) {
	if (!strengths?.length && !weaknesses?.length) return null;

	return (
		<div className="space-y-8 pt-2">
			{strengths && strengths.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-base font-bold text-foreground flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5 text-primary" />
						Điểm mạnh nổi bật
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{strengths.map((item, index) => (
							<div key={index} className="p-4.5 rounded-2xl bg-secondary/60 border border-border space-y-1.5">
								<h4 className="font-bold text-foreground text-sm flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
									{item.title}
								</h4>
								<p className="text-xs text-muted-foreground leading-relaxed pl-6">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{weaknesses && weaknesses.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-base font-bold text-foreground flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-destructive" />
						Điểm yếu cần lưu ý
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{weaknesses.map((item, index) => (
							<div key={index} className="p-4.5 rounded-2xl bg-secondary/60 border border-border space-y-1.5">
								<h4 className="font-bold text-foreground text-sm flex items-center gap-2">
									<AlertCircle className="w-4 h-4 text-destructive shrink-0" />
									{item.title}
								</h4>
								<p className="text-xs text-muted-foreground leading-relaxed pl-6">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function PremiumContentBlock({
	title,
	items,
}: {
	title: string;
	items?: string[];
}) {
	if (!items || items.length === 0) return null;

	return (
		<div className="space-y-4 pt-4 border-t border-border">
			<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
				{title}
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{items.map((item, idx) => (
					<div
						key={idx}
						className="p-4 rounded-2xl bg-secondary/40 border border-border text-xs sm:text-sm font-medium flex items-center gap-3 transition-all"
					>
						<span className="w-2 h-2 rounded-full bg-primary shrink-0" />
						<span className="text-foreground">{item}</span>
					</div>
				))}
			</div>
		</div>
	);
}

function NavButton({
	id,
	label,
	active,
	onClick,
}: {
	id: string;
	label: string;
	active: boolean;
	onClick: (id: string) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onClick(id)}
			className={cn(
				"w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
				active
					? "bg-accent text-accent-foreground font-bold border border-border"
					: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
			)}
		>
			{label}
		</button>
	);
}
