"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultView, { ResultOut } from "@/components/mbti/ResultView";
import { Loader2, AlertCircle } from "lucide-react";
import { mbtiApi } from "@/lib/api/mbti";

export default function MBTIResultPage() {
	const params = useParams();
	const submissionId = params.submission_id as string;

	const [result, setResult] = useState<ResultOut | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!submissionId) return;

		const fetchResult = async () => {
			try {
				setLoading(true);
				setError(null);

				const res = await mbtiApi.getSubmissionResult(submissionId);
				const data = res?.result || res;

				if (!data || !data.personality_code) {
					setError("Không tìm thấy dữ liệu kết quả lượt làm bài.");
					return;
				}

				setResult(data);
			} catch (err: any) {
				console.error("Error:", err.response?.data || err);

				const backendMessage = err.response?.data?.detail;
				if (err.response?.status === 404) {
					setError(backendMessage || "Không tìm thấy mã lượt làm bài này trong hệ thống.");
				} else {
					setError(backendMessage || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchResult();
	}, [submissionId]);

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
				<Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
				<p className="text-sm font-medium text-slate-600">Đang tải phân tích kết quả MBTI...</p>
			</div>
		);
	}

	if (error || !result) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
				<div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
					<AlertCircle className="w-8 h-8" />
				</div>
				<h1 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h1>
				<p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
				<a
					href="/mbti"
					className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
				>
					Làm bài trắc nghiệm mới
				</a>
			</div>
		);
	}

	return <ResultView result={result} />;
}