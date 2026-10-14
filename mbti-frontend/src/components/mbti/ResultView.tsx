"use client";

import React, { useState } from "react";
import {
	CheckCircle2,
	AlertCircle,
	Lock,
	RotateCcw,
	Sparkles,
	Briefcase,
	UserCheck,
	HeartHandshake,
	ArrowRight,
	ShieldCheck,
} from "lucide-react";

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

// Bảng tên hiển thị cho các trục
const AXIS_NAMES: Record<string, { name: string; leftLabel: string; rightLabel: string }> = {
	EI: { name: "Năng lượng", leftLabel: "Hướng ngoại", rightLabel: "Hướng nội" },
	SN: { name: "Tâm trí", leftLabel: "Trực giác", rightLabel: "Quan sát" },
	TF: { name: "Bản chất", leftLabel: "Lý trí", rightLabel: "Cảm xúc" },
	JP: { name: "Chiến thuật", leftLabel: "Nguyên tắc", rightLabel: "Linh hoạt" },
	AT: { name: "Bản sắc", leftLabel: "Quyết đoán", rightLabel: "Cầu tiến" },
};

export default function ResultView({ result }: { result: ResultOut }) {
	const [activeTab, setActiveTab] = useState<string>("traits");

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

	return (
		<div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 text-slate-800">
			<div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

				{/* MAIN CONTENT */}
				<div className="lg:col-span-8 space-y-10">

					{/* HEADER BANNER */}
					<div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-4">
							<Sparkles className="w-3.5 h-3.5" />
							Kết quả phân tích MBTI
						</div>

						<h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2">
							{result.title}
						</h1>
						<div className="text-2xl font-bold tracking-widest text-indigo-600 mb-4">
							{result.personality_code}
						</div>

						<p className="text-slate-600 max-w-2xl mx-auto text-base leading-relaxed mb-6">
							{result.summary || `Bạn thuộc nhóm tính cách ${result.personality_code} - ${result.title}.`}
						</p>

						<div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
							<ShieldCheck className="w-4 h-4 text-emerald-500" />
							Độ tin cậy bài làm: <span className="font-semibold text-slate-700">{result.validity_score}%</span>
						</div>
					</div>

					{/* SECTION 1: ĐẶC ĐIỂM TÍNH CÁCH & SPECTRUM */}
					<section id="traits" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
						<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
							<div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
								<UserCheck className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">1. Đặc điểm tính cách</h2>
								<p className="text-xs text-slate-400">Tỷ lệ các trục năng lượng và tư duy cốt lõi</p>
							</div>
						</div>

						{/* Mô tả tổng quan Traits */}
						{traitsModule?.overview && (
							<p className="text-slate-600 leading-relaxed text-sm sm:text-base">
								{traitsModule.overview}
							</p>
						)}

						{/* BẢNG SPECTRUM 5 TRỤC */}
						<div className="space-y-6 pt-2">
							<h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
								Thang đo tỷ lệ các trục
							</h3>

							<div className="space-y-5">
								{Object.entries(result.spectrum || {}).map(([axisKey, data]) => {
									const meta = AXIS_NAMES[axisKey] || {
										name: axisKey,
										leftLabel: data.left_code,
										rightLabel: data.right_code,
									};

									return (
										<div key={axisKey} className="space-y-2">
											<div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
												<span className={data.dominant === data.left_code ? "text-indigo-600 font-bold" : "text-slate-500"}>
													{data.left_percentage.toFixed(1)}% {meta.leftLabel} ({data.left_code})
												</span>
												<span className="text-xs text-slate-400 font-normal px-2 py-0.5 bg-slate-100 rounded-md">
													{meta.name}
												</span>
												<span className={data.dominant === data.right_code ? "text-indigo-600 font-bold" : "text-slate-500"}>
													({data.right_code}) {meta.rightLabel} {data.right_percentage.toFixed(1)}%
												</span>
											</div>

											{/* Thanh Progress bar */}
											<div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60">
												<div
													className="bg-indigo-500 h-full rounded-l-full transition-all duration-500"
													style={{ width: `${data.left_percentage}%` }}
												/>
												<div
													className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
													style={{ width: `${data.right_percentage}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</section>

					{/* SECTION 2: CON ĐƯỜNG SỰ NGHIỆP */}
					<section id="career" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
						<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
							<div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
								<Briefcase className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">2. Con đường sự nghiệp</h2>
								<p className="text-xs text-slate-400">Môi trường làm việc và thế mạnh nghề nghiệp</p>
							</div>
						</div>

						{careerModule?.overview && (
							<p className="text-slate-600 leading-relaxed text-sm sm:text-base">
								{careerModule.overview}
							</p>
						)}

						{/* Điểm mạnh & Điểm yếu sự nghiệp */}
						<StrengthWeaknessBlock
							strengths={careerModule?.free_content?.strengths}
							weaknesses={careerModule?.free_content?.weaknesses}
						/>

						{/* 10 Con đường nghề nghiệp phù hợp nhất */}
						<PremiumContentBlock
							title="Khám phá 10 Con đường nghề nghiệp phù hợp nhất"
							items={careerModule?.premium_content?.top_10_career_paths}
							badgeColor="indigo"
						/>
					</section>

					{/* SECTION 3: SỰ PHÁT TRIỂN CÁ NHÂN */}
					<section id="growth" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
						<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
							<div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
								<Sparkles className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">3. Sự phát triển cá nhân</h2>
								<p className="text-xs text-slate-400">Động lực phát triển và rào cản tâm lý</p>
							</div>
						</div>

						{growthModule?.overview && (
							<p className="text-slate-600 leading-relaxed text-sm sm:text-base">
								{growthModule.overview}
							</p>
						)}

						<StrengthWeaknessBlock
							strengths={growthModule?.free_content?.strengths}
							weaknesses={growthModule?.free_content?.weaknesses}
						/>

						{/* 6 nguồn nạp năng lượng */}
						<PremiumContentBlock
							title="6 Nguồn khai thác năng lượng tự nhiên"
							items={growthModule?.premium_content?.energy_sources}
							badgeColor="purple"
						/>

						{/* 6 yếu tố gây suy kiệt */}
						<PremiumContentBlock
							title="6 Nguyên nhân gây hao hụt năng lượng cần tránh"
							items={growthModule?.premium_content?.energy_drains}
							badgeColor="amber"
						/>
					</section>

					{/* SECTION 4: CÁC MỐI QUAN HỆ */}
					<section id="relationships" className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
						<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
							<div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
								<HeartHandshake className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">4. Các mối quan hệ</h2>
								<p className="text-xs text-slate-400">Cách bạn giao tiếp và kết nối tình cảm</p>
							</div>
						</div>

						{relationsModule?.overview && (
							<p className="text-slate-600 leading-relaxed text-sm sm:text-base">
								{relationsModule.overview}
							</p>
						)}

						<StrengthWeaknessBlock
							strengths={relationsModule?.free_content?.strengths}
							weaknesses={relationsModule?.free_content?.weaknesses}
						/>

						{/* 6 thế mạnh tiềm ẩn */}
						<PremiumContentBlock
							title="6 Sức mạnh tiềm ẩn trong mối quan hệ"
							items={relationsModule?.premium_content?.relationship_strengths}
							badgeColor="rose"
						/>

						{/* 6 rủi ro thói quen */}
						<PremiumContentBlock
							title="6 Thói quen rủi ro có thể ảnh hưởng đến mối quan hệ"
							items={relationsModule?.premium_content?.relationship_risks}
							badgeColor="amber"
						/>
					</section>

					{/* NÚT LÀM LẠI BÀI TEST */}
					<div className="text-center pt-4">
						<button
							type="button"
							onClick={() => window.location.href = "/mbti"}
							className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-semibold text-sm shadow-md"
						>
							<RotateCcw className="w-4 h-4" />
							Làm lại bài kiểm tra MBTI
						</button>
					</div>
				</div>

				{/* STICKY SIDEBAR */}
				<div className="lg:col-span-4 sticky top-6 space-y-6">
					<div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">

						{/* MINI PROFILE */}
						<div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
							<span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
								Loại tính cách của bạn:
							</span>
							<h3 className="text-2xl font-black text-slate-900">{result.title}</h3>
							<div className="inline-block px-3 py-0.5 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-full">
								{result.personality_code}
							</div>
						</div>

						{/* MỤC LỤC TRANG (NAVIGATION) */}
						<div className="space-y-1">
							<span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
								Trên trang này
							</span>

							<NavButton
								id="traits"
								label="1. Đặc điểm tính cách"
								active={activeTab === "traits"}
								onClick={scrollToSection}
							/>
							<NavButton
								id="career"
								label="2. Con đường sự nghiệp"
								active={activeTab === "career"}
								onClick={scrollToSection}
							/>
							<NavButton
								id="growth"
								label="3. Sự phát triển cá nhân"
								active={activeTab === "growth"}
								onClick={scrollToSection}
							/>
							<NavButton
								id="relationships"
								label="4. Các mối quan hệ"
								active={activeTab === "relationships"}
								onClick={scrollToSection}
							/>
						</div>

						{/* NÚT ACTION PHỤ */}
						<div className="pt-2 border-t border-slate-100 space-y-2">
							<button
								type="button"
								onClick={() => alert("Tính năng chia sẻ đang phát triển!")}
								className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
							>
								Chia sẻ kết quả bài làm
							</button>
						</div>
					</div>
				</div>

			</div>
		</div>
	);
}

// COMPONENT PHỤ (SUB-COMPONENTS)

// Khối hiển thị Danh sách Điểm mạnh & Điểm yếu
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
			{/* ĐIỂM MẠNH */}
			{strengths && strengths.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-base font-bold text-emerald-700 flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5 text-emerald-500" />
						Điểm mạnh của bạn
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{strengths.map((item, index) => (
							<div key={index} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 space-y-1">
								<h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
									<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									{item.title}
								</h4>
								<p className="text-xs text-slate-600 leading-relaxed pl-5">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ĐIỂM YẾU */}
			{weaknesses && weaknesses.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-base font-bold text-amber-700 flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-amber-500" />
						Điểm yếu cần lưu ý
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{weaknesses.map((item, index) => (
							<div key={index} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/60 space-y-1">
								<h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
									<AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
									{item.title}
								</h4>
								<p className="text-xs text-slate-600 leading-relaxed pl-5">
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

// Khối hiển thị Nội dung Premium
function PremiumContentBlock({
	title,
	items,
	badgeColor = "indigo",
}: {
	title: string;
	items?: string[];
	badgeColor?: "indigo" | "emerald" | "purple" | "rose" | "amber";
}) {
	if (!items || items.length === 0) return null;

	const colorClasses = {
		indigo: "bg-indigo-50/60 text-indigo-700 border-indigo-100/80",
		emerald: "bg-emerald-50/60 text-emerald-700 border-emerald-100/80",
		purple: "bg-purple-50/60 text-purple-700 border-purple-100/80",
		rose: "bg-rose-50/60 text-rose-700 border-rose-100/80",
		amber: "bg-amber-50/60 text-amber-700 border-amber-100/80",
	};

	return (
		<div className="space-y-4 pt-4 border-t border-slate-100">
			<h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
				{title}
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{items.map((item, idx) => (
					<div
						key={idx}
						className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all ${colorClasses[badgeColor]}`}
					>
						<span className="w-2 h-2 rounded-full bg-current shrink-0" />
						<span>{item}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// Nút điều hướng Sidebar
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
			className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${active
				? "bg-indigo-50 text-indigo-600 font-bold"
				: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
				}`}
		>
			{label}
		</button>
	);
}