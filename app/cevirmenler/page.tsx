import { getBooks, Book } from "@/lib/sheets";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import GuideNav from "@/components/layout/GuideNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Çevirmenler Atlası — İthaki Bilimkurgu Klasikleri Çevirmenleri",
  description:
    "İthaki Bilimkurgu Klasikleri dizisini Türkçeye kazandıran çevirmenler ve serideki tüm çeviri eserleri listesi.",
  openGraph: {
    title: "Çevirmenler Atlası — İthaki BKK",
    description:
      "İthaki Bilimkurgu Klasikleri dizisini Türkçeye kazandıran çevirmenler ve serideki tüm çeviri eserleri listesi.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com"}/cevirmenler`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com"}/cevirmenler`,
  },
};

export const revalidate = 60;

export default async function TranslatorsPage() {
  const books = await getBooks();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com";

  // Çevirmenler Haritası & İstatistikleri
  const translatorMap: Record<string, { total: number; books: Book[] }> = {};

  books.forEach((b) => {
    if (b.cevirmen && b.cevirmen.trim()) {
      const translator = b.cevirmen.trim();
      if (!translatorMap[translator]) {
        translatorMap[translator] = { total: 0, books: [] };
      }
      translatorMap[translator].total++;
      translatorMap[translator].books.push(b);
    }
  });

  const totalTranslators = Object.keys(translatorMap).length;
  const sortedTranslators = Object.entries(translatorMap).sort((a, b) => b[1].total - a[1].total);

  // Schema.org Breadcrumb & CollectionPage
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Çevirmenler Atlası",
        item: `${baseUrl}/cevirmenler`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "İthaki Bilimkurgu Klasikleri Çevirmenler Atlası",
    description: `İthaki Bilimkurgu Klasikleri dizisini Türkçeye kazandıran ${totalTranslators} çevirmen ve serideki eserleri.`,
    url: `${baseUrl}/cevirmenler`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: sortedTranslators.map(([translator, data], idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Person",
          name: translator,
          jobTitle: "Çevirmen",
        },
      })),
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* ── Başlık & Açıklama ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] mb-2.5 font-mono">
            <span>Çevirmenler Atlası</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Külliyat Çevirmenleri Atlası
          </h1>
        </div>

        <ExcelExportButton books={books} />
      </div>

      {/* ── 📖 Tarafsız & Bilgilendirici Özet Metni ── */}
      <div className="space-y-3.5 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans mb-8">
        <p>
          İthaki Bilimkurgu Klasikleri dizisi, dünya bilimkurgu edebiyatının farklı dönem ve alt türlerine ait eserlerin Türkçeye aktarılmasında geniş bir çevirmen kadrosunun çalışmalarını bir araya getirmektedir. Serideki 116 cilt; İngilizce, Rusça, Fransızca ve diğer dillerdeki özgün metinlerden çevrilmiş olup külliyat boyunca <strong>{totalTranslators}</strong> farklı çevirmen görev almıştır.
        </p>
        <p>
          Aşağıdaki liste üzerinden seride yer alan tüm çevirmenleri, dizide çevirdikleri eser sayılarını ve ilgili kitapların serideki sıra numaraları ile yayın yıllarını inceleyebilirsiniz.
        </p>
      </div>

      {/* ── 🚀 Kategori Navigasyonu (Alt Seriler / Yazarlar / Çevirmenler) ── */}
      <GuideNav />

      {/* ── ✍️ ÇEVİRMENLER LİSTESİ ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTranslators.map(([translator, data]) => {
          return (
            <div
              key={translator}
              className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                    {translator}
                  </h2>
                  <div className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                    İthaki BKK serisinde <strong className="text-[var(--accent)] font-mono">{data.total}</strong> çeviri eseri bulunuyor
                  </div>
                </div>

                <span className="text-xs font-mono font-extrabold bg-[var(--surface-sub)] text-[var(--accent)] border border-[var(--border-main)] px-2.5 py-1 rounded-md">
                  {data.total} Eser
                </span>
              </div>

              {/* Çevirmenin Eserleri */}
              <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-main)]/60 text-xs sm:text-sm">
                {data.books.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/kitap/${b.slug}`}
                    className="flex items-center justify-between gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] font-medium group"
                  >
                    <span className="truncate">
                      <strong className="font-mono text-[var(--accent)] mr-1">#{b.sira_no}</strong> {b.kitap_adi}
                      <span className="text-[var(--text-muted)] text-[11px] ml-1.5 font-normal">
                        ({b.yazar_adi})
                      </span>
                    </span>
                    {b.ithaki_yayin_yili && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">
                        {b.ithaki_yayin_yili}
                      </span>
                    )}
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
