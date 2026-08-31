import { Book } from "@/lib/sheets";
import { Users, Crown, BookOpen, Sparkles, Hash } from "lucide-react";

interface Props {
  books: Book[];
}

export default function HeroStats({ books }: Props) {
  // 1. Dinamik Tekil Yazar Sayısı
  const authorMap: Record<string, number> = {};
  books.forEach((b) => {
    const author = b.yazar_adi?.trim();
    if (author) {
      authorMap[author] = (authorMap[author] || 0) + 1;
    }
  });
  const uniqueAuthorCount = Object.keys(authorMap).length;

  // 2. Dinamik En Çok Eseri Olan Yazar
  let topAuthorName = "";
  let topAuthorCount = 0;
  Object.entries(authorMap).forEach(([name, count]) => {
    if (count > topAuthorCount) {
      topAuthorCount = count;
      topAuthorName = name;
    }
  });

  // Popüler Etiketler
  const tags = [
    "#İthakiBilimkurgu",
    "#BKK",
    "#BilimkurguKlasikleri",
    "#İthakiYayınları",
    "#SciFi",
    "#KitapÖnerisi",
    "#Dune",
  ];

  return (
    <div className="mt-5 space-y-4">
      {/* ── 🏷️ Sosyal Medya & Keşif Etiketleri ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center text-[11px] sm:text-xs font-bold text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border-main)] px-2.5 py-1 rounded-md hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-default shadow-2xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── 📊 Dinamik Otomatik Güncellenen Seri İstatistik Butonları ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-1">
        {/* Toplam Cilt */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[var(--surface-card)] border border-[var(--border-main)] text-[var(--text-primary)] shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{books.length} Ciltlik Külliyat</span>
        </div>

        {/* Farklı Yazar Sayısı */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[var(--surface-card)] border border-[var(--border-main)] text-[var(--text-primary)] shadow-xs">
          <Users className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
          <span>{uniqueAuthorCount} Farklı Yazar</span>
        </div>

        {/* En Çok Eseri Olan Yazar */}
        {topAuthorName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[var(--surface-card)] border border-[var(--border-main)] text-[var(--text-primary)] shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>En Çok Eser: <strong className="text-[var(--accent)] font-bold">{topAuthorName}</strong> ({topAuthorCount})</span>
          </div>
        )}

        {/* Canlı Güncellenme Rozeti */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[var(--accent-soft)] border border-[var(--border-main)] text-[var(--accent)] shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Canlı Tablo Senkron</span>
        </div>
      </div>
    </div>
  );
}
