import { getBooks } from "@/lib/sheets";
import BookCatalog from "@/components/book/BookCatalog";
import HeroStats from "@/components/book/HeroStats";

export const revalidate = 60; // 60 saniye ISR ile canlı güncelleme

export default async function HomePage() {
  const books = await getBooks();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Hero Başlık, Açıklama, Etiketler & Dinamik İstatistikler ── */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-3">
          Bilimkurgu Klasikleri
        </h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
          İthaki Yayınları Bilimkurgu Klasikleri külliyatı; kişisel okuma günlüğüm, kitap listeleri ve kitap yorumlarım.
        </p>

        {/* Dinamik Canlı Seri İstatistikleri & Sosyal Keşif Etiketleri */}
        <HeroStats books={books} />
      </div>

      {/* ── Katalog & İlerleme Paneli ── */}
      <BookCatalog initialBooks={books} />
    </div>
  );
}
