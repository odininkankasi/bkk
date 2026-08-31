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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
      <div className="bg-white dark:bg-[#131720] border border-[#e7e2d7] dark:border-[#232a36] rounded-2xl p-5 sm:p-6 mb-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Seri Tamamlama İlerlemesi
            </div>
            <div className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 mt-0.5">
              {readCount} / {total} Kitap Okundu <span className="text-emerald-700 dark:text-emerald-400 text-lg sm:text-xl font-sans font-semibold">(%{pct})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExcelExportButton books={initialBooks} />
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="w-full bg-[#f3efe6] dark:bg-[#1a202c] h-2.5 rounded-full overflow-hidden mb-5">
          <div
            className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* 4'lü Hızlı Sayaç */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#fbf9f5] dark:bg-[#0c0f14] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-3">
            <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">{total}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Toplam Eser</div>
          </div>
          <div className="bg-[#fbf9f5] dark:bg-[#0c0f14] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-3">
            <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">{readCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Okunan</div>
          </div>
          <div className="bg-[#fbf9f5] dark:bg-[#0c0f14] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-3">
            <div className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400">{unreadCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Okunacak</div>
          </div>
          <div className="bg-[#fbf9f5] dark:bg-[#0c0f14] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-3">
            <div className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400">{ownedCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Kitaplıkta</div>
          </div>
        </div>
      </div>

      {/* ── Arama, Filtreler & Görünüm Değiştirici (Sticky) ── */}
      <div className="sticky top-18 z-30 bg-[#fbf9f5]/95 dark:bg-[#0c0f14]/95 backdrop-blur-md border border-[#e7e2d7] dark:border-[#232a36] rounded-2xl p-3.5 sm:p-4 mb-6 shadow-xs">
        {/* Arama Çubuğu */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kitap adı, yazar veya seri no (#01) ara..."
            className="w-full bg-white dark:bg-[#131720] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 dark:focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filtre Sekmeleri & Görünüm Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tab Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-amber-900 dark:bg-amber-600 text-white"
                  : "bg-white dark:bg-[#131720] text-stone-600 dark:text-stone-400 border border-[#e7e2d7] dark:border-[#232a36] hover:border-amber-800"
              }`}
            >
              Tümü ({total})
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "read"
                  ? "bg-amber-900 dark:bg-amber-600 text-white"
                  : "bg-white dark:bg-[#131720] text-stone-600 dark:text-stone-400 border border-[#e7e2d7] dark:border-[#232a36] hover:border-amber-800"
              }`}
            >
              ✅ Okunanlar ({readCount})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "unread"
                  ? "bg-amber-900 dark:bg-amber-600 text-white"
                  : "bg-white dark:bg-[#131720] text-stone-600 dark:text-stone-400 border border-[#e7e2d7] dark:border-[#232a36] hover:border-amber-800"
              }`}
            >
              ⌛ Okunacaklar ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("owned")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "owned"
                  ? "bg-amber-900 dark:bg-amber-600 text-white"
                  : "bg-white dark:bg-[#131720] text-stone-600 dark:text-stone-400 border border-[#e7e2d7] dark:border-[#232a36] hover:border-amber-800"
              }`}
            >
              📚 Kitaplıkta ({ownedCount})
            </button>
            <button
              onClick={() => setActiveTab("rated")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "rated"
                  ? "bg-amber-900 dark:bg-amber-600 text-white"
                  : "bg-white dark:bg-[#131720] text-stone-600 dark:text-stone-400 border border-[#e7e2d7] dark:border-[#232a36] hover:border-amber-800"
              }`}
            >
              ⭐ Puanlananlar
            </button>
          </div>

          {/* Görünüm & Sıralama */}
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white dark:bg-[#131720] text-stone-700 dark:text-stone-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#e7e2d7] dark:border-[#232a36] focus:outline-none focus:border-amber-800 cursor-pointer"
            >
              <option value="no-asc">Sıra: 1 → Son</option>
              <option value="no-desc">Sıra: Son → 1</option>
              <option value="rating">Puana Göre (En Yüksek)</option>
              <option value="title">Kitap Adı (A-Z)</option>
            </select>

            <div className="flex items-center border border-[#e7e2d7] dark:border-[#232a36] rounded-lg p-0.5 bg-white dark:bg-[#131720]">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#f3efe6] dark:bg-[#1a202c] text-stone-900 dark:text-stone-100 font-bold"
                    : "text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
                title="Liste Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#f3efe6] dark:bg-[#1a202c] text-stone-900 dark:text-stone-100 font-bold"
                    : "text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
                title="Kapaklı Izgara Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Kitap Çıktısı ── */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 text-stone-500 dark:text-stone-400">
          <div className="text-3xl mb-2">🪐</div>
          <div className="font-serif text-lg font-semibold">Aradığınız kriterde kitap bulunamadı.</div>
          <div className="text-xs mt-1">Filtreleri veya arama kelimenizi kontrol edebilirsiniz.</div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.sira_no || book.slug} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredBooks.map((book) => (
            <BookListRow key={book.sira_no || book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
