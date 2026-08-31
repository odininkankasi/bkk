import { getBooks, Book } from "@/lib/sheets";
import Link from "next/link";
import { Layers } from "lucide-react";
import ExcelExportButton from "@/components/book/ExcelExportButton";
import GuideNav from "@/components/layout/GuideNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alt Seriler — İthaki Bilimkurgu Klasikleri Seri Rehberi",
  description:
    "İthaki Bilimkurgu Klasikleri külliyatında seri içinde devam eden alt seriler (Dune, Mars Üçlemesi vb.) ve okuma sıraları.",
  openGraph: {
    title: "Alt Seriler & Edebi Evrenler — İthaki BKK",
    description:
      "İthaki Bilimkurgu Klasikleri külliyatında seri içinde devam eden alt seriler ve okuma sıraları.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com"}/seri-rehberi`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com"}/seri-rehberi`,
  },
};

export const revalidate = 60;

export default async function SeriesGuidePage() {
  const books = await getBooks();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkkitaplik.com";

  // Alt Seriler Tanımları
  const subSeries = [
    {
      id: "dune",
      title: "Dune Serisi",
      author: "Frank Herbert",
      tag: "6 Ciltlik Dizi",
      desc: "Frank Herbert tarafından kaleme alınan ve 6 kitaptan oluşan Dune serisi; Arrakis gezegeni, baharat ticareti ve hanedanlıklar arasındaki mücadeleleri konu alan bilimkurgu serisidir.",
      bookNumbers: ["1", "7", "16", "26", "57", "59"],
    },
    {
      id: "mars",
      title: "Mars Üçlemesi",
      author: "Kim Stanley Robinson",
      tag: "3 Ciltlik Üçleme",
      desc: "Kim Stanley Robinson'ın Kızıl Gezegen'in dünyalaştırılması, yerleşimi ve sonrasındaki siyasi ve ekolojik süreçleri ele aldığı 3 kitaptan oluşan serisidir.",
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
        name: "Alt Seriler",
        item: `${baseUrl}/seri-rehberi`,
      },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "İthaki Bilimkurgu Klasikleri Alt Seriler",
    description: "İthaki Bilimkurgu Klasikleri dizisinde yer alan alt seriler ve devam kitapları.",
    url: `${baseUrl}/seri-rehberi`,
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
            <span>Seri Rehberi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Alt Seriler &amp; Devam Kitapları
          </h1>
        </div>

        <ExcelExportButton books={books} />
      </div>

      {/* ── 📖 Tarafsız & Bilgilendirici Özet Metni ── */}
      <div className="space-y-3.5 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-sans mb-8">
        <p>
          İthaki Bilimkurgu Klasikleri dizisi, bağımsız metinlerin yanı sıra aynı evrende geçen ve birbirini takip eden çok ciltli alt serileri de içermektedir. Frank Herbert&apos;ın altı ciltlik <em>Dune</em> serisi ve Kim Stanley Robinson&apos;ın <em>Mars Üçlemesi</em> gibi eserler, dizide farklı sıra numaralarıyla yayımlanmıştır.
        </p>
        <p>
          Bu sayfada, külliyat içerisinde yer alan alt serileri, serilerin kapsadığı kitapları ve serideki yayın sıra numaralarını bir arada takip edebilirsiniz.
        </p>
      </div>

      {/* ── 🚀 Kategori Navigasyonu (Alt Seriler / Yazarlar / Çevirmenler) ── */}
      <GuideNav />

      {/* ── 🌟 ALT SERİLER LİSTESİ ── */}
      <section className="space-y-8">
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
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-0.5">
                  {series.title}
                </h2>
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
      </section>
    </div>
  );
}
