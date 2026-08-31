"use client";

import { useState, useMemo } from "react";
import { Book } from "@/lib/sheets";
import BookCard from "./BookCard";
import BookListRow from "./BookListRow";
import ExcelExportButton from "./ExcelExportButton";
import { Search, LayoutGrid, List } from "lucide-react";

interface Props {
  initialBooks: Book[];
}

export default function BookCatalog({ initialBooks }: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread" | "owned" | "rated">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [sortBy, setSortBy] = useState<"no-asc" | "no-desc" | "rating" | "title">("no-asc");

  // İstatistikler
  const total = initialBooks.length;
  const readCount = useMemo(() => initialBooks.filter((b) => b.okundu === "Evet").length, [initialBooks]);
  const unreadCount = total - readCount;
  const ownedCount = useMemo(() => initialBooks.filter((b) => b.kitaplikta_var === "Evet").length, [initialBooks]);
  const pct = Math.round((readCount / total) * 100) || 0;

  // Filtreleme ve Sıralama
  const filteredBooks = useMemo(() => {
    let list = initialBooks.filter((b) => {
      const noMatch = "#" + (b.sira_no || "");
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (b.kitap_adi && b.kitap_adi.toLowerCase().includes(q)) ||
        (b.yazar_adi && b.yazar_adi.toLowerCase().includes(q)) ||
        (b.sira_no && b.sira_no.includes(q)) ||
        noMatch.includes(q);

      if (!matchesQuery) return false;

      if (activeTab === "read") return b.okundu === "Evet";
      if (activeTab === "unread") return b.okundu !== "Evet";
      if (activeTab === "owned") return b.kitaplikta_var === "Evet";
      if (activeTab === "rated") return (b.puan || 0) > 0;

      return true;
    });

    // Sıralama
    return list.sort((a, b) => {
      if (sortBy === "no-desc") return (parseInt(b.sira_no) || 0) - (parseInt(a.sira_no) || 0);
      if (sortBy === "rating") return (b.puan || 0) - (a.puan || 0);
      if (sortBy === "title") return a.kitap_adi.localeCompare(b.kitap_adi, "tr");
      return (parseInt(a.sira_no) || 0) - (parseInt(b.sira_no) || 0);
    });
  }, [initialBooks, query, activeTab, sortBy]);

  return (
    <div>
      {/* ── İlerleme & Sayaç Paneli ── */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-5 sm:p-7 mb-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Seri Tamamlama İlerlemesi
            </div>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
              {readCount} / {total} Kitap Okundu{" "}
              <span className="text-[var(--accent)] text-xl sm:text-2xl font-sans font-bold">(%{pct})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExcelExportButton books={initialBooks} />
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="w-full bg-[var(--bar-bg)] h-3 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[var(--bar-fill)] h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* 4'lü Hızlı Sayaç */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-mono">{total}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Toplam Eser</div>
          </div>
          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--read-tag-text)] font-mono">{readCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Okunan</div>
          </div>
          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--gold)] font-mono">{unreadCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Okunacak</div>
          </div>
          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
            <div className="text-xl sm:text-2xl font-extrabold text-[var(--owned-tag-text)] font-mono">{ownedCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Kitaplıkta</div>
          </div>
        </div>
      </div>

      {/* ── Arama, Filtreler & Görünüm Değiştirici (Sticky) ── */}
      <div className="sticky top-18 z-30 bg-[var(--bg-page)]/95 backdrop-blur-md border border-[var(--border-main)] rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
        {/* Arama Çubuğu */}
        <div className="relative mb-3.5">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kitap adı, yazar veya seri no (#01) ara..."
            className="w-full bg-[var(--surface-input)] border border-[var(--border-main)] rounded-xl py-3 pl-11 pr-4 text-base font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors shadow-xs"
          />
        </div>

        {/* Filtre Sekmeleri & Görünüm Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tab Butonları */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:border-[var(--accent)]"
              }`}
            >
              Tümü ({total})
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "read"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:border-[var(--accent)]"
              }`}
            >
              ✅ Okunanlar ({readCount})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "unread"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:border-[var(--accent)]"
              }`}
            >
              ⌛ Okunacaklar ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("owned")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "owned"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:border-[var(--accent)]"
              }`}
            >
              📚 Kitaplıkta ({ownedCount})
            </button>
            <button
              onClick={() => setActiveTab("rated")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "rated"
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-main)] hover:border-[var(--accent)]"
              }`}
            >
              ⭐ Puanlananlar
            </button>
          </div>

          {/* Görünüm & Sıralama */}
          <div className="flex items-center gap-2.5 ml-auto">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[var(--surface-card)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg border border-[var(--border-main)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="no-asc">Sıra: 1 → Son</option>
              <option value="no-desc">Sıra: Son → 1</option>
              <option value="rating">Puana Göre (En Yüksek)</option>
              <option value="title">Kitap Adı (A-Z)</option>
            </select>

            <div className="flex items-center border border-[var(--border-main)] rounded-lg p-0.5 bg-[var(--surface-card)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--surface-sub)] text-[var(--text-primary)] font-bold shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                title="Kapaklı Izgara Görünümü"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[var(--surface-sub)] text-[var(--text-primary)] font-bold shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
                title="Liste Görünümü"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kitap Çıktısı ── */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <div className="text-4xl mb-3">🪐</div>
          <div className="font-serif text-xl font-bold text-[var(--text-primary)]">Aradığınız kriterde kitap bulunamadı.</div>
          <div className="text-sm mt-1.5">Filtreleri veya arama kelimenizi kontrol edebilirsiniz.</div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredBooks.map((book) => (
            <BookCard key={book.sira_no || book.slug} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredBooks.map((book) => (
            <BookListRow key={book.sira_no || book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
