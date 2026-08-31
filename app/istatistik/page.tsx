import { getBooks } from "@/lib/sheets";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { BookOpen, Star, Award, CheckCircle, Clock, Library, Calendar, Compass } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kişisel Okuma İstatistikleri & Analiz — İthaki BKK",
  description: "İthaki Bilimkurgu Klasikleri serisi kişisel okuma günlüğü analizleri, okuma hız göstergeleri, yazar dağılımları ve puan matrisi.",
};

export const revalidate = 60;

export default async function StatisticsPage() {
  const books = await getBooks();

  const total = books.length;
  const readBooks = books.filter((b) => b.okundu === "Evet");
  const readCount = readBooks.length;
  const unreadCount = total - readCount;
  const ownedBooks = books.filter((b) => b.kitaplikta_var === "Evet");
  const ownedCount = ownedBooks.length;
  const ownedUnreadBooks = books.filter((b) => b.kitaplikta_var === "Evet" && b.okundu !== "Evet");
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

  // Yıllara Göre Okuma Dağılımı
  const yearsMap: Record<string, number> = {};
  readBooks.forEach((b) => {
    const rawDate = b.tarih_2 || b.tarih_1 || "";
    const match = rawDate.match(/20\d\d/);
    const year = match ? match[0] : "Tarihsiz";
    yearsMap[year] = (yearsMap[year] || 0) + 1;
  });

  const sortedYears = Object.entries(yearsMap).sort((a, b) => {
    if (a[0] === "Tarihsiz") return 1;
    if (b[0] === "Tarihsiz") return -1;
    return parseInt(b[0]) - parseInt(a[0]);
  });

  // En Çok Eseri Olan / Okunan Yazarlar
  const authorCounts: Record<string, { total: number; read: number }> = {};
  books.forEach((b) => {
    const author = b.yazar_adi || "Bilinmeyen Yazar";
    if (!authorCounts[author]) authorCounts[author] = { total: 0, read: 0 };
    authorCounts[author].total++;
    if (b.okundu === "Evet") authorCounts[author].read++;
  });

  const topReadAuthors = Object.entries(authorCounts)
    .filter((a) => a[1].read > 0)
    .sort((a, b) => b[1].read - a[1].read || b[1].total - a[1].total)
    .slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-14">
      {/* ── Native Uygulama Geri Navigasyonu ── */}
      <div className="mb-6">
        <BackButton label="Geri" fallbackHref="/" />
      </div>

      {/* ── Başlık ── */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] mb-2.5 font-mono">
            <span>Kişisel Okuma Raporu</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Okuma İstatistikleri
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg mt-2 max-w-2xl font-medium">
            İthaki Bilimkurgu Klasikleri serisi kişisel okuma günlüğünüzün detaylı metrikleri, puanları ve okuma grafikleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seri-rehberi"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[var(--border-main)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-xs"
          >
            <Compass className="w-4 h-4 text-[var(--accent)]" />
            <span>Seri &amp; Alt Seriler Rehberi ➜</span>
          </Link>
          <ExcelExportButton books={books} />
        </div>
      </div>

      {/* ── BÜYÜK İLERLEME VE HEDEF KARTI ── */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 mb-10 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Külliyat Tamamlama Seviyesi
            </div>
            <div className="font-serif font-bold text-2xl sm:text-4xl text-[var(--text-primary)] mt-1">
              %{pct} Tamamlandı
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase">Ortalama Puanım</div>
            <div className="font-serif font-bold text-2xl sm:text-3xl text-[var(--gold)] flex items-center justify-end gap-1.5 mt-1">
              <span>★ {avgRating}</span>
              <span className="text-xs text-[var(--text-muted)] font-sans font-semibold">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full bg-[var(--bar-bg)] h-3.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-emerald-700 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Metrik Kutuları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-4">
            <BookOpen className="w-5 h-5 text-[var(--accent)] mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">{total}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Toplam Eser</div>
          </div>

          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-black text-[var(--read-tag-text)] font-mono">{readCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Okundu</div>
          </div>

          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-4">
            <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-black text-[var(--gold)] font-mono">{unreadCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Okunacak</div>
          </div>

          <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-4">
            <Library className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <div className="text-xl sm:text-2xl font-black text-[var(--owned-tag-text)] font-mono">{ownedCount}</div>
            <div className="text-xs font-bold text-[var(--text-muted)] uppercase mt-0.5">Kitaplıkta</div>
          </div>
        </div>
      </div>

      {/* ── 3 SÜTUNLU DETAY İSTATİSTİKLERİ ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* 1. Yıllara Göre Okuma Dağılımı */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--accent)] mb-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Yıllara Göre Okuma Dağılımı</span>
          </div>

          <div className="space-y-3">
            {sortedYears.map(([year, count]) => (
              <div key={year}>
                <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                  <span className="font-mono text-[var(--text-primary)]">{year}</span>
                  <span className="text-[var(--accent)]">{count} Kitap</span>
                </div>
                <div className="w-full bg-[var(--bar-bg)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--accent)] h-full rounded-full"
                    style={{ width: `${(count / readCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. En Çok Okuduğum Yazarlar */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--accent)] mb-4">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>En Çok Okuduğum Yazarlar</span>
          </div>

          <div className="space-y-3">
            {topReadAuthors.map(([author, count]) => (
              <div key={author} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="font-serif font-bold text-[var(--text-primary)] truncate pr-2">
                  {author}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 text-xs font-black font-mono text-[var(--read-tag-text)]">
                  {count.read} Okundu
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Puan Değerlendirme Özeti */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--accent)] mb-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Puan Dağılımım</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                <span className="text-[var(--gold)] font-serif">★★★★★ (5 Yıldız)</span>
                <span className="text-[var(--text-primary)] font-mono font-black">{rating5}</span>
              </div>
              <div className="w-full bg-[var(--bar-bg)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--gold)] h-full rounded-full"
                  style={{ width: `${total ? (rating5 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                <span className="text-[var(--gold)] font-serif">★★★★☆ (4 Yıldız)</span>
                <span className="text-[var(--text-primary)] font-mono font-black">{rating4}</span>
              </div>
              <div className="w-full bg-[var(--bar-bg)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--gold)]/80 h-full rounded-full"
                  style={{ width: `${total ? (rating4 / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm font-bold mb-1">
                <span className="text-[var(--gold)] font-serif">★★★☆☆ (3 Yıldız)</span>
                <span className="text-[var(--text-primary)] font-mono font-black">{rating3}</span>
              </div>
              <div className="w-full bg-[var(--bar-bg)] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--gold)]/60 h-full rounded-full"
                  style={{ width: `${total ? (rating3 / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KİTAPLIKTA OLUP SIRADA BEKLEYENLER ── */}
      {ownedUnreadBooks.length > 0 && (
        <section className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--accent)]">
              <Library className="w-5 h-5" />
              <span>Kitaplığınızda Olup Sırada Bekleyen Eserler ({ownedUnreadBooks.length} Kitap)</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 font-medium">
            Fiziksel veya dijital kitaplığınızda mevcut olup henüz okumadığınız BKK kitapları:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ownedUnreadBooks.slice(0, 12).map((b) => (
              <Link
                key={b.slug}
                href={`/kitap/${b.slug}`}
                className="group bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-2.5 flex flex-col hover:border-[var(--accent)] hover:-translate-y-1 transition-all shadow-2xs"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-[var(--surface-card)]">
                  <img
                    src={b.kapak_gorseli || "/icon.png"}
                    alt={b.kitap_adi}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-1 left-1 bg-[#14100c]/90 text-[#faf4e6] text-[10px] font-black px-1.5 py-0.5 rounded font-mono">
                    #{b.sira_no}
                  </div>
                </div>
                <div className="font-serif font-bold text-xs text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--accent)]">
                  {b.kitap_adi}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
