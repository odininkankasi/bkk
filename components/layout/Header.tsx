import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BookOpen, BarChart2, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Seri Başlığı */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-800/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center font-serif font-bold text-base group-hover:scale-105 transition-transform">
            🪐
          </div>
          <div>
            <div className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-none group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
              Bilimkurgu Klasikleri
            </div>
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-0.5">
              İthaki Yayınları • Dijital Kitaplık
            </div>
          </div>
        </Link>

        {/* Sağ Navigasyon & Tema */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Kitaplık</span>
          </Link>
          
          <Link
            href="/istatistik"
            className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
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
