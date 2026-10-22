import Link from 'next/link';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-800 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:opacity-90">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
              16
            </span>
            <span className="tracking-tight text-slate-900">16Personalities</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/mbti" className="hover:text-emerald-600 transition-colors">
              Bài kiểm tra tính cách
            </Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">
              Các loại tính cách
            </Link>
            <Link href="#" className="hover:text-emerald-600 transition-colors">
              Bài viết
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <button type="button" className="hover:text-slate-900 transition-colors">
              Đăng nhập
            </button>
            <span className="px-2.5 py-1 bg-slate-100 rounded-full text-xs text-slate-600 border border-slate-200 flex items-center gap-1">
              🇻🇳 Tiếng Việt
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MBTI Assessment System. All rights reserved.</p>
      </footer>
    </div>
  );
}