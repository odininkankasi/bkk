import { getBooks } from "@/lib/sheets";
import BookCatalog from "@/components/book/BookCatalog";
import HeroStats from "@/components/book/HeroStats";

export const revalidate = 60; // 60 saniye ISR ile canlı güncelleme

export default async function HomePage() {
  const books = await getBooks();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Hero Başlık, Açıklama, Editoryal Not, Etiketler & Dinamik İstatistikler ── */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-3">
          Bilimkurgu Klasikleri
        </h1>

        <p className="text-[var(--text-primary)] text-base sm:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
          İthaki Yayınları Bilimkurgu Klasikleri külliyatı; kişisel okuma günlüğüm, kitap listeleri ve kitap yorumlarım.
        </p>

        {/* 📜 BKK Serisi Tarihçesi & Editoryal Not */}
        <p className="font-serif italic text-[var(--text-secondary)] text-sm sm:text-[15px] leading-relaxed max-w-2xl mx-auto mt-3.5 pt-3.5 border-t border-[var(--border-main)]/70">
          2015 yılında Frank Herbert'ın <em>Dune</em> eseriyle başlayan bu yolculuk; seriye dahil edilen veya dışarıda bırakılan tercihler, <em>Mars Üçlemesi</em> gibi devam kitaplarının geç çevrilmesi sebebiyle okurları tarafından ara ara eleştirilse de, şüphesiz ülkemizde bilimkurgu edebiyatının en kapsamlı, en istikrarlı ve en uzun soluklu serisi olmaya devam ediyor.
        </p>

        {/* Dinamik Canlı Seri İstatistikleri & Sosyal Keşif Etiketleri */}
        <HeroStats books={books} />
      </div>

      {/* ── Katalog & İlerleme Paneli ── */}
      <BookCatalog initialBooks={books} />
    </div>
  );
}
