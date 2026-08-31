import { getBooks, Book } from "@/lib/sheets";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import GuideNav from "@/components/layout/GuideNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yazarlar Atlası — İthaki Bilimkurgu Klasikleri Yazarları",
  description:
    "İthaki Bilimkurgu Klasikleri dizisinde yer alan 67 usta yazar ve serideki tüm eserleri.",
};

export const revalidate = 60;

export default async function AuthorsPage() {
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* ── Başlık & Açıklama ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] mb-2.5 font-mono">
            <span>Yazarlar Atlası</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Külliyat Yazarları Atlası
          </h1>
        </div>

        <ExcelExportButton books={books} />
      </div>

      {/* ── 📖 Editoryal Özet Metni (Açık ve Ferah Tipografi) ── */}
      <div className="space-y-3.5 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans mb-8">
        <p>
          19. yüzyılın erken dönem spekülatif anlatılarından 20. yüzyılın altın çağına, yeni dalgadan siberpunk akımına kadar uzanan İthaki Bilimkurgu Klasikleri; insanlığın geleceğini, varoluşunu ve sınırlarını sorgulayan <strong>{totalAuthors}</strong> vizyoner yazarın başyapıtlarını bir araya getiriyor. Arthur C. Clarke, Isaac Asimov, Philip K. Dick, Ursula K. Le Guin, Octavia E. Butler ve Strugatski Kardeşler gibi edebiyat anıtlarının yanı sıra Doğu Bloku&apos;ndan Latin Amerika&apos;ya kadar dünya bilimkurgusunun gizli kalmış hazineleri bu atlas üzerinde buluşuyor.
        </p>
        <p>
          Aşağıdaki külliyat atlası üzerinden seride yer alan tüm yazarları eser sayılarıyla birlikte inceleyebilir, favori yazarınızın dizideki tüm ciltlerine ve sıra numaralarına tek tıkla ulaşabilirsiniz.
        </p>
      </div>

      {/* ── 🚀 Kategori Navigasyonu (Alt Seriler / Yazarlar / Çevirmenler) ── */}
      <GuideNav />

      {/* ── 👥 YAZARLAR LİSTESİ ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAuthors.map(([author, data]) => {
          return (
            <div
              key={author}
              className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                    {author}
                  </h2>
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
      </section>
    </div>
  );
}
