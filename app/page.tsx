import { getBooks } from "@/lib/sheets";
import BookCatalog from "@/components/book/BookCatalog";

export const revalidate = 60; // 60 saniye ISR

export default async function HomePage() {
  const books = await getBooks();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Hero Başlık & Açıklama ── */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-800/10 dark:bg-amber-400/10 mb-3">
          <span>İthaki Yayınları Külliyatı</span>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-3">
          Bilimkurgu Klasikleri
        </h1>

        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          İthaki Yayınları'nın 116+ ciltlik efsanevi bilimkurgu külliyatı takip, kişisel okuma günlüğü ve detaylı inceleme platformu.
        </p>
      </div>

      {/* ── Katalog & İlerleme Paneli ── */}
      <BookCatalog initialBooks={books} />
    </div>
  );
}
