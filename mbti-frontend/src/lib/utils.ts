import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Lấy domain gốc Backend (VD: https://embitiai.onrender.com)
const BACKEND_DOMAIN = (process.env.NEXT_PUBLIC_API_URL || 'https://embitiai.onrender.com')
	.replace(/\/api\/v1\/?$/, '');

// Hàm xử lý URL ảnh
export function getFullImageUrl(path?: string | null): string {
	// Kiểm tra path rỗng hoặc placeholder hỏng
	if (!path || path === 'string' || path.includes('via.placeholder.com')) {
		return 'https://placehold.co/300x300?text=No+Image';
	}

	if (path.startsWith('blob:')) {
		return 'https://placehold.co/300x300?text=Invalid+Image';
	}

	// Lọc bỏ localhost:8000 nếu bị lưu cứng trong Database cũ
	if (path.includes('localhost:8000')) {
		path = path.replace('http://localhost:8000', '').replace('https://localhost:8000', '');
	}

	// Nếu là URL tuyệt đối hợp lệ (Supabase Storage, Cloudinary, data base64...)
	if (
		path.startsWith('http://') ||
		path.startsWith('https://') ||
		path.startsWith('data:')
	) {
		return path;
	}

	// Chuẩn hóa đường dẫn tương đối (ví dụ: /static/images/xxx.webp)
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://embitiai.onrender.com';

	// Tách lấy domain gốc Render (bỏ phần /api/v1)
	try {
		const origin = new URL(backendBaseUrl).origin;
		return `${origin}${cleanPath}`;
	} catch {
		return `https://embitiai.onrender.com${cleanPath}`;
	}
}