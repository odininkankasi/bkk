import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooks, getBookBySlug } from "@/lib/sheets";
import ReadingPanel from "@/components/book/ReadingPanel";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((b) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Kitap Bulunamadı" };

  const no = book.sira_no ? `#${String(book.sira_no).padStart(2, "0")} ` : "";
  return {
    title: `${no}${book.kitap_adi} — ${book.yazar_adi} | İthaki BKK`,
    description: `${book.kitap_adi} (${book.yazar_adi}) - İthaki Bilimkurgu Klasikleri serisi ${no}künye bilgileri, tanıtım bülteni ve kişisel okuma günlüğü.`,
    openGraph: {
      title: `${no}${book.kitap_adi} — ${book.yazar_adi}`,
      description: `${book.kitap_adi} İthaki Bilimkurgu Klasikleri serisi incelemesi.`,
      images: book.kapak_gorseli ? [{ url: book.kapak_gorseli }] : [],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const books = await getBooks();
  const bookIndex = books.findIndex((b) => b.slug === slug || b.sira_no === slug || String(b.sira_no).padStart(2, "0") === slug);

  if (bookIndex === -1) {
    notFound();
  }

  const book = books[bookIndex];
  const prevBook = bookIndex > 0 ? books[bookIndex - 1] : null;
  const nextBook = bookIndex < books.length - 1 ? books[bookIndex + 1] : null;

  const no = book.sira_no ? "#" + String(book.sira_no).padStart(2, "0") : "";
  const cover = book.kapak_gorseli || "/icon.png";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Geri Dön Linki ── */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 hover:text-amber-800 dark:text-stone-400 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Bilimkurgu Klasikleri Listesine Dön</span>
        </Link>
      </div>

      {/* ── Kitap Başlığı & Kapak Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
        {/* Sol Sütun: Kapak Görseli */}
        <div className="md:col-span-4 flex justify-center">
          <div className="w-full max-w-[260px] md:max-w-none aspect-[2/3] rounded-2xl overflow-hidden shadow-md border border-[#e7e2d7] dark:border-[#232a36] bg-[#f3efe6] dark:bg-[#1a202c] sticky top-24">
            <img
              src={cover}
              alt={book.kitap_adi}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Sağ Sütun: Kitap Bilgileri & Okuma Paneli */}
        <div className="md:col-span-8">
          {/* Başlık Alanı */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-400 bg-amber-900/10 dark:bg-amber-400/10 mb-2">
              <span>İthaki BKK {no}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-tight mb-1.5">
              {book.kitap_adi}
            </h1>

            <div className="font-serif text-lg sm:text-xl italic text-amber-800 dark:text-amber-400">
              {book.yazar_adi}
            </div>
          </div>

          {/* 🌟 1. KİŞİSEL OKUMA & NOT PANELİ (ÜST KISIM) */}
          <ReadingPanel book={book} />

          {/* 📖 2. KÜNYE BİLGİLERİ */}
          <div className="border-t border-[#e7e2d7] dark:border-[#232a36] pt-6 mb-8">
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mb-4">
              <Layers className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <span>Eser &amp; Yayın Künyesi</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase">Özgün Adı</div>
                <div className="font-medium text-stone-900 dark:text-stone-100 mt-0.5">
                  {book.ozgun_adi || book.kitap_adi}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase">Çevirmen</div>
                <div className="font-medium text-stone-900 dark:text-stone-100 mt-0.5">
                  {book.cevirmen || "İthaki Çeviri Kurulu"}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase">Yayınevi</div>
                <div className="font-medium text-stone-900 dark:text-stone-100 mt-0.5">
                  İthaki Yayınları
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase">Seri Sıra Numarası</div>
                <div className="font-mono font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  {no || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* 📝 3. TANITIM & ARKA KAPAK YAZISI (Editoryal Ferah Açık Tasarım) */}
          <div className="border-t border-[#e7e2d7] dark:border-[#232a36] pt-6">
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mb-3">
              <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />
              <span>Tanıtım &amp; Arka Kapak Bülteni</span>
            </div>

            <div className="prose dark:prose-invert prose-stone max-w-none text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-sm sm:text-base">
              {book.tanitim_yazisi ? (
                <p>{book.tanitim_yazisi}</p>
              ) : (
                <p>
                  Bilimkurgu edebiyatının mihenk taşlarından biri olan <strong>{book.kitap_adi}</strong>, usta yazar{" "}
                  <em>{book.yazar_adi}</em> imzasını taşıyor. İthaki Bilimkurgu Klasikleri serisinin <strong>{no}</strong>{" "}
                  numaralı bu eseri, insanlığın geleceğine, evrenin sınırlarına ve bilinmeyene dair unutulmaz bir anlatı
                  sunuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Önceki / Sonraki Kitap Navigasyonu ── */}
      <div className="border-t border-[#e7e2d7] dark:border-[#232a36] pt-8 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevBook ? (
          <Link
            href={`/kitap/${prevBook.slug}`}
            className="group bg-white dark:bg-[#131720] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-4 flex items-center gap-3.5 hover:border-amber-800/40 dark:hover:border-amber-500/40 hover:bg-[#fbf9f5] dark:hover:bg-[#1a202c] transition-colors shadow-xs"
          >
            <ChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-400 uppercase">◀ Önceki Eser</div>
              <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-400">
                #{prevBook.sira_no} {prevBook.kitap_adi}
              </div>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextBook ? (
          <Link
            href={`/kitap/${nextBook.slug}`}
            className="group bg-white dark:bg-[#131720] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-4 flex items-center justify-between gap-3.5 text-right hover:border-amber-800/40 dark:hover:border-amber-500/40 hover:bg-[#fbf9f5] dark:hover:bg-[#1a202c] transition-colors sm:ml-auto w-full shadow-xs"
          >
            <div className="min-w-0 flex-1 text-left sm:text-right">
              <div className="text-[11px] font-bold text-stone-400 uppercase">Sonraki Eser ▶</div>
              <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-400">
                #{nextBook.sira_no} {nextBook.kitap_adi}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </div>
  );
}
