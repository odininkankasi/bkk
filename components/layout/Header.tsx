import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { BookOpen, BarChart2, Compass, Users, Feather, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-[var(--border-main)] bg-[var(--bg-page)] sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-page)]/90">
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
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-sub)]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kitaplık</span>
          </Link>

          {/* 🌟 Seri Rehberi Ana Açılır Menüsü */}
          <div className="relative group hidden sm:block">
            <Link
              href="/seri-rehberi"
              className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-sub)]"
            >
              <Compass className="w-4 h-4" />
              <span>Seri Rehberi</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:rotate-180 transition-transform duration-200" />
            </Link>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl shadow-lg p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform translate-y-1 group-hover:translate-y-0">
              <Link
                href="/seri-rehberi"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-sub)] transition-colors"
              >
                <Compass className="w-4 h-4 text-[var(--accent)]" />
                <span>Alt Seriler (Dune, Mars)</span>
              </Link>
              <Link
                href="/yazarlar"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-sub)] transition-colors"
              >
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>Yazarlar Atlası</span>
              </Link>
              <Link
                href="/cevirmenler"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface-sub)] transition-colors"
              >
                <Feather className="w-4 h-4 text-[var(--accent)]" />
                <span>Çevirmenler Atlası</span>
              </Link>
            </div>
          </div>
          
          <Link
            href="/istatistik"
            className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-sub)]"
          >
            <BarChart2 className="w-4 h-4" />
            <span>İstatistik</span>
          </Link>

          <div className="ml-1 pl-2 border-l border-[var(--border-main)]">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
