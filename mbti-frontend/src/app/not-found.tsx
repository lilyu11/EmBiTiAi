'use client';

import Link from 'next/link';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
	return (
		<div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 text-center bg-background">
			<div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
					<Sparkles className="w-3.5 h-3.5 text-primary" />
					Lỗi 404 • Không tìm thấy trang
				</div>

				{/* Number / Heading */}
				<div className="space-y-3">
					<h1 className="text-6xl sm:text-7xl font-black text-foreground tracking-tight">
						404
					</h1>
					<h2 className="text-xl font-bold text-foreground">
						Trang bạn tìm kiếm không tồn tại
					</h2>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Có vẻ như đường dẫn đã thay đổi hoặc trang bạn truy cập không còn tồn tại trên hệ thống.
					</p>
				</div>

				{/* Action buttons */}
				<div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
					<Link
						href="/"
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:opacity-95 text-primary-foreground font-semibold rounded-2xl text-sm transition-all shadow-xs active:scale-98"
					>
						<Home className="w-4 h-4" />
						<span>Về trang chủ</span>
					</Link>
					<button
						type="button"
						onClick={() => window.history.back()}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-2xl text-sm transition-all cursor-pointer"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Trang trước</span>
					</button>
				</div>
			</div>
		</div>
	);
}
