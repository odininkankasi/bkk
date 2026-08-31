import { getBooks } from "@/lib/sheets";
import Link from "next/link";
import { ArrowLeft, BookOpen, Star, Award, TrendingUp, CheckCircle, Clock, Library } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Okuma İstatistikleri & Analiz — İthaki BKK",
  description: "İthaki Bilimkurgu Klasikleri serisi kişisel okuma istatistikleri, yazar dağılımları ve seri tamamlama grafikleri.",
};

export default async function StatisticsPage() {
  const books = await getBooks();

  const total = books.length;
  const readBooks = books.filter((b) => b.okundu === "Evet");
  const readCount = readBooks.length;
  const unreadCount = total - readCount;
  const ownedBooks = books.filter((b) => b.kitaplikta_var === "Evet");
  const ownedCount = ownedBooks.length;
  const pct = Math.round((readCount / total) * 100) || 0;

  // Puan Dağılımı
  const ratedBooks = books.filter((b) => b.puan && b.puan > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (ratedBooks.reduce((acc, b) => acc + (b.puan || 0), 0) / ratedBooks.length).toFixed(1)
      : "—";

  const rating5 = books.filter((b) => b.puan === 5).length;
  const rating4 = books.filter((b) => b.puan === 4).length;
  const rating3 = books.filter((b) => b.puan === 3).length;

  // En Çok Eseri Olan / Okunan Yazarlar
  const authorCounts: Record<string, { total: number; read: number }> = {};
  books.forEach((b) => {
    const author = b.yazar_adi || "Bilinmeyen Yazar";
    if (!authorCounts[author]) authorCounts[author] = { total: 0, read: 0 };
    authorCounts[author].total++;
    if (b.okundu === "Evet") authorCounts[author].read++;
  });

  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Geri Dön Linki ── */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 hover:text-amber-800 dark:text-stone-400 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kitaplık Listesine Dön</span>
        </Link>
      </div>

      {/* ── Başlık ── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-800/10 dark:bg-amber-400/10 mb-2">
            <span>Analiz &amp; Rapor</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Okuma İstatistikleri
          </h1>
        </div>

        <ExcelExportButton books={books} />
      </div>

      {/* ── Büyük İlerleme Kartı ── */}
      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Külliyat Tamamlama Oranı
            </div>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-1">
              %{pct} Tamamlandı
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-stone-500 dark:text-stone-400">Ortalama Puanım</div>
            <div className="font-serif font-bold text-2xl text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>★ {avgRating}</span>
              <span className="text-xs text-stone-400 font-sans font-normal">/ 5</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-3.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Metrik Kutuları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5">
            <BookOpen className="w-5 h-5 text-amber-800 dark:text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{total}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Toplam Eser</div>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{readCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Okundu</div>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{unreadCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Okunacak</div>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5">
            <Library className="w-5 h-5 text-sky-600 dark:text-sky-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400">{ownedCount}</div>
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">Kitaplıkta</div>
          </div>
        </div>
      </div>

      {/* ── 2 Sütunlu Detay İstatistikleri ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sol: Yazar Dağılımı */}
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-4">
            <Award className="w-4 h-4" />
            <span>Külliyatta En Çok Yer Alan Yazarlar</span>
          </div>

          <div className="space-y-3">
            {topAuthors.map(([author, count]) => (
              <div key={author} className="flex items-center justify-between text-sm">
                <div className="font-serif font-medium text-stone-900 dark:text-stone-100 truncate pr-2">
                  {author}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-xs font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400">{count.read} okundu</span>
                  <span className="text-stone-400">/ {count.total} kitap</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: Puanlama Dağılımı */}
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-4">
            <Star className="w-4 h-4" />
            <span>Puan Değerlendirme Özeti</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-500 font-serif">★★★★★ (5 Yıldız)</span>
                <span className="text-stone-600 dark:text-stone-400">{rating5} Eser</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${total ? (rating5 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-500 font-serif">★★★★☆ (4 Yıldız)</span>
                <span className="text-stone-600 dark:text-stone-400">{rating4} Eser</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500/80 h-full rounded-full"
                  style={{ width: `${total ? (rating4 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-500 font-serif">★★★☆☆ (3 Yıldız)</span>
                <span className="text-stone-600 dark:text-stone-400">{rating3} Eser</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500/60 h-full rounded-full"
                  style={{ width: `${total ? (rating3 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-xs text-stone-500 dark:text-stone-400 italic">
              Puanlar Google Sheets tablonuzdan canlı senkronize edilir.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
