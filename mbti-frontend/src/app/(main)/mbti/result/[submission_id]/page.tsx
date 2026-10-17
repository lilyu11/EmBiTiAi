'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ResultView, { ResultOut } from "@/components/mbti/ResultView";
import { Loader2, AlertCircle, Home, RotateCcw } from "lucide-react";
import { mbtiApi } from "@/lib/api/mbti";
import Link from "next/link";

export default function MBTIResultPage() {
	const params = useParams();
	const submissionId = params.submission_id as string;

	const [result, setResult] = useState<ResultOut | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchResult = useCallback(async () => {
		if (!submissionId) {
			setError("Không tìm thấy mã lượt làm bài hợp lệ trong đường dẫn.");
			setLoading(false);
			return;
		}

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
			const backendMessage = err.response?.data?.detail;
			if (err.response?.status === 404) {
				setError(backendMessage || "Không tìm thấy kết quả cho mã lượt làm bài này.");
			} else {
				setError(backendMessage || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
			}
		} finally {
			setLoading(false);
		}
	}, [submissionId]);

	useEffect(() => {
		fetchResult();
	}, [fetchResult]);

	if (loading) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
				<div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center text-primary shadow-2xs">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
				<div className="space-y-1">
					<h2 className="text-lg font-bold text-foreground">Đang tổng hợp kết quả MBTI...</h2>
					<p className="text-xs text-muted-foreground">Chúng tôi đang phân tích các trục tính cách dựa trên câu trả lời của bạn.</p>
				</div>
			</div>
		);
	}

	if (error || !result) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 text-center">
				<div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
					<div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-2xs">
						<AlertCircle className="w-7 h-7" />
					</div>
					<div className="space-y-2">
						<h1 className="text-xl font-bold text-foreground">Không tìm thấy kết quả</h1>
						<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{error}</p>
					</div>
					<div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
						<button
							type="button"
							onClick={fetchResult}
							className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:opacity-95 text-primary-foreground font-semibold rounded-2xl text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
						>
							<RotateCcw className="w-4 h-4" />
							<span>Thử tải lại</span>
						</button>
						<Link
							href="/mbti"
							className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-2xl text-xs sm:text-sm transition-all"
						>
							<RotateCcw className="w-4 h-4" />
							<span>Làm bài kiểm tra mới</span>
						</Link>
						<Link
							href="/"
							className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-2xl text-xs sm:text-sm transition-all"
						>
							<Home className="w-4 h-4" />
							<span>Về trang chủ</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return <ResultView result={result} />;
}
