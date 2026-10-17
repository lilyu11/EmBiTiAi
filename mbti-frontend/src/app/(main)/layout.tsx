import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/15 selection:text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-2xs">
        <div className="w-full max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group transition-transform hover:opacity-95">
            <span className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xs">
              <Compass className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground leading-none">MBTI Insights</span>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Trắc nghiệm & Thấu hiểu bản thân</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/mbti" className="hover:text-primary transition-colors">
              MBTI Test
            </Link>
          </nav>

          {/* Language / Status */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-3.5 py-1.5 bg-secondary text-secondary-foreground rounded-full border border-border/60 flex items-center gap-1.5 shadow-2xs">
              🇻🇳 Tiếng Việt
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card/50 py-10 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MBTI Assessment System. Thiết kế tối giản & tinh tế.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="/mbti" className="hover:text-primary transition-colors">Làm bài Test</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
