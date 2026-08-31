import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BookOpen, BarChart2, Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-main)] bg-[var(--bg-page)]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Seri Başlığı */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
            🪐
          </div>
          <div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[var(--text-primary)] tracking-tight leading-none group-hover:text-[var(--accent)] transition-colors">
              Bilimkurgu Klasikleri
            </div>
          </div>
        </Link>

        {/* Sağ Navigasyon & Tema */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Kitaplık</span>
          </Link>

          <Link
            href="/seri-rehberi"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Seri Rehberi</span>
          </Link>
          
          <Link
            href="/istatistik"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">İstatistik</span>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
