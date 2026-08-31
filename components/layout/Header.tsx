import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BookOpen, BarChart2, Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-main)] bg-[var(--bg-page)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Seri Başlığı */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-[var(--border-main)] bg-[var(--surface-sub)] flex-shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/icon.png"
              alt="İthaki Bilimkurgu Klasikleri"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[var(--text-primary)] tracking-tight leading-none group-hover:text-[var(--accent)] transition-colors">
              Bilimkurgu Klasikleri
            </div>
          </div>
        </Link>

        {/* Sağ Navigasyon & Tema (Masaüstü) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kitaplık</span>
          </Link>

          <Link
            href="/seri-rehberi"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Seri Rehberi</span>
          </Link>
          
          <Link
            href="/istatistik"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            <span>İstatistik</span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
