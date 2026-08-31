import { getBooks, Book } from "@/lib/sheets";
import Link from "next/link";
import { Users, Layers, ChevronRight } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seri Rehberi & Alt Seriler — İthaki BKK",
  description:
    "İthaki Bilimkurgu Klasikleri külliyat rehberi: Alt seriler (Dune, Mars Üçlemesi) ve külliyat yazarları atlası.",
};

export const revalidate = 60;

export default async function SeriesGuidePage() {
  const books = await getBooks();

  // Yazarlar Haritası & İstatistikleri
  const authorMap: Record<string, { total: number; books: Book[] }> = {};

  books.forEach((b) => {
    const author = b.yazar_adi?.trim() || "Bilinmeyen Yazar";
    if (!authorMap[author]) {
      authorMap[author] = { total: 0, books: [] };
    }
    authorMap[author].total++;
    authorMap[author].books.push(b);
  });

  const totalAuthors = Object.keys(authorMap).length;
  const sortedAuthors = Object.entries(authorMap).sort((a, b) => b[1].total - a[1].total);

  // Alt Seriler Tanımları
  const subSeries = [
    {
      id: "dune",
      title: "Dune Serisi",
      author: "Frank Herbert",
      tag: "6 Ciltlik Efsanevi Destan",
      desc: "Bilimkurgu tarihinin en görkemli destanı. Çöl gezegeni Arrakis, baharat melodisi, Bene Gesserit tarikatı ve insanlığın geleceğini şekillendiren efsanevi hanedanlık savaşları.",
      bookNumbers: ["1", "7", "16", "26", "57", "59"],
    },
    {
      id: "mars",
      title: "Mars Üçlemesi",
      author: "Kim Stanley Robinson",
      tag: "3 Ciltlik Başyapıt Üçleme",
      desc: "İnsanlığın Kızıl Gezegen'i dünyalaştırma (terraforming), kolonileştirme ve yeni bir medeniyet kurma sürecini anlatan modern bilimkurgunun en gerçekçi başyapıtı.",
      bookNumbers: ["45", "113", "114"],
    },
  ];

  const subSeriesWithBooks = subSeries.map((s) => {
    const matchedBooks = s.bookNumbers
      .map((num) => books.find((b) => b.sira_no == num))
      .filter(Boolean) as Book[];

    return {
      ...s,
      books: matchedBooks,
      totalCount: matchedBooks.length,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* ── Başlık & Açıklama ── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] mb-2.5 font-mono">
            <span>Genel Külliyat Rehberi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Seri Rehberi
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg mt-2 max-w-2xl font-medium">
            İthaki Bilimkurgu Klasikleri külliyatının alt serileri, seri içinde seri olan ciltler ve yazarlar atlası.
          </p>
        </div>

        <ExcelExportButton books={books} />
      </div>

      {/* ── 🌟 BÖLÜM 1: SERİ İÇİNDE DEVAM EDEN ALT SERİLER ── */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[var(--border-main)]">
          <Layers className="w-6 h-6 text-[var(--accent)]" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Seri İçinde Devam Eden Alt Seriler
          </h2>
        </div>

        <div className="space-y-8">
          {subSeriesWithBooks.map((series) => (
            <div
              key={series.id}
              className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-6 sm:p-8 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-[var(--accent)] font-mono">
                    {series.author}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-0.5">
                    {series.title}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-lg bg-[var(--surface-sub)] text-[var(--text-primary)] border border-[var(--border-main)] font-mono">
                    {series.tag}
                  </span>
                </div>
              </div>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-medium mb-6">
                {series.desc}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                {series.books.map((b, idx) => {
                  const cover = b.kapak_gorseli || "/icon.png";
                  return (
                    <Link
                      key={b.slug}
                      href={`/kitap/${b.slug}`}
                      className="group bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-2.5 flex flex-col hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 shadow-2xs"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-[var(--surface-card)]">
                        <img
                          src={cover}
                          alt={b.kitap_adi}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute top-1 left-1 bg-[#14100c]/90 text-[#faf4e6] text-[10px] font-black px-1.5 py-0.5 rounded font-mono">
                          #{b.sira_no}
                        </div>
                      </div>
                      <div className="text-[11px] font-bold text-[var(--accent)] font-mono">
                        {idx + 1}. Kitap
                      </div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--accent)] mt-0.5">
                        {b.kitap_adi}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 👥 BÖLÜM 2: TÜM YAZARLAR ATLASI (KÜLLİYAT YAZARLARI) ── */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[var(--border-main)]">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[var(--accent)]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Külliyat Yazarlar Atlası ({totalAuthors} Yazar)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAuthors.map(([author, data]) => {
            return (
              <div
                key={author}
                className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                      {author}
                    </h3>
                    <div className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                      İthaki BKK serisinde <strong className="text-[var(--accent)] font-mono">{data.total}</strong> eseri bulunuyor
                    </div>
                  </div>

                  <span className="text-xs font-mono font-extrabold bg-[var(--surface-sub)] text-[var(--text-primary)] border border-[var(--border-main)] px-2.5 py-1 rounded-md">
                    {data.total} Kitap
                  </span>
                </div>

                {/* Yazarın Eserleri Listesi */}
                <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-main)]/60 text-xs sm:text-sm">
                  {data.books.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/kitap/${b.slug}`}
                      className="flex items-center justify-between gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium group"
                    >
                      <span className="truncate">
                        <strong className="font-mono text-[var(--accent)] mr-1">#{b.sira_no}</strong> {b.kitap_adi}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
