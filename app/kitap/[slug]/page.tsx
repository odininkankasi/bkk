import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooks } from "@/lib/sheets";
import ReadingPanel from "@/components/book/ReadingPanel";
import { ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";
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
    description: `${book.kitap_adi} (${book.yazar_adi}) - İthaki Bilimkurgu Klasikleri serisi ${no}detayları ve kişisel okuma günlüğü.`,
    openGraph: {
      title: `${no}${book.kitap_adi} — ${book.yazar_adi}`,
      description: `${book.kitap_adi} İthaki Bilimkurgu Klasikleri serisi incelemesi.`,
      images: book.kapak_gorseli ? [{ url: book.kapak_gorseli }] : [],
    },
  };
}

async function getBookBySlug(slug: string) {
  const books = await getBooks();
  return (
    books.find((b) => b.slug === slug || b.sira_no === slug || String(b.sira_no).padStart(2, "0") === slug) || null
  );
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const books = await getBooks();
  const bookIndex = books.findIndex(
    (b) => b.slug === slug || b.sira_no === slug || String(b.sira_no).padStart(2, "0") === slug
  );

  if (bookIndex === -1) {
    notFound();
  }

  const book = books[bookIndex];
  const prevBook = bookIndex > 0 ? books[bookIndex - 1] : null;
  const nextBook = bookIndex < books.length - 1 ? books[bookIndex + 1] : null;

  const no = book.sira_no ? "#" + String(book.sira_no).padStart(2, "0") : "";
  const cover = book.kapak_gorseli || "/icon.png";

  const hasExtraMeta = Boolean(book.cevirmen || book.ozgun_adi || book.sayfa_sayisi || book.isbn);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Kitap Başlığı & Kapak Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 items-start mb-10">
        {/* Sol Sütun: Kapak Görseli */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full max-w-[280px] md:max-w-none aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-[var(--border-main)] bg-[var(--surface-sub)] sticky top-6">
            <img src={cover} alt={book.kitap_adi} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Sağ Sütun: Kitap Bilgileri & Okuma Paneli */}
        <div className="md:col-span-7">
          {/* Başlık Alanı */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] mb-2.5 font-mono">
              <span>İthaki BKK {no}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-2">
              {book.kitap_adi}
            </h1>

            <div className="font-serif text-xl sm:text-2xl italic text-[var(--accent)] font-medium">
              {book.yazar_adi}
            </div>
          </div>

          {/* 🌟 1. KİŞİSEL OKUMA & NOT PANELİ (ÜST KISIM) */}
          <ReadingPanel book={book} />

          {/* 📖 2. KÜNYE BİLGİLERİ */}
          <div className="border-t border-[var(--border-main)] pt-7 mb-8">
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
              <span>Eser &amp; Yayın Künyesi</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base">
              <div>
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Yayınevi</div>
                <div className="font-semibold text-[var(--text-primary)] mt-1">İthaki Yayınları</div>
              </div>

              <div>
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Seri Sıra Numarası</div>
                <div className="font-mono font-black text-base text-[var(--text-primary)] mt-1">
                  {no || "—"}
                </div>
              </div>

              {book.ozgun_adi && (
                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Özgün Adı</div>
                  <div className="font-semibold text-[var(--text-primary)] mt-1">{book.ozgun_adi}</div>
                </div>
              )}

              {book.cevirmen && (
                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Çevirmen</div>
                  <div className="font-semibold text-[var(--text-primary)] mt-1">{book.cevirmen}</div>
                </div>
              )}

              {book.sayfa_sayisi && (
                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Sayfa Sayısı</div>
                  <div className="font-semibold text-[var(--text-primary)] mt-1">{book.sayfa_sayisi} sayfa</div>
                </div>
              )}

              {book.isbn && (
                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase">ISBN</div>
                  <div className="font-mono text-xs sm:text-sm font-semibold text-[var(--text-primary)] mt-1">
                    {book.isbn}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📝 3. TANITIM & ARKA KAPAK YAZISI (Varsa Göster) */}
          {book.tanitim_yazisi && (
            <div className="border-t border-[var(--border-main)] pt-7">
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3.5">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
                <span>Tanıtım &amp; Arka Kapak Bülteni</span>
              </div>

              <div className="text-[var(--text-secondary)] leading-relaxed font-sans text-base sm:text-lg">
                <p>{book.tanitim_yazisi}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Önceki / Sonraki Kitap Navigasyonu ── */}
      <div className="border-t border-[var(--border-main)] pt-8 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevBook ? (
          <Link
            href={`/kitap/${prevBook.slug}`}
            className="group bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:border-[var(--accent)] hover:bg-[var(--surface-sub)] transition-colors shadow-xs"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-black text-[var(--text-muted)] uppercase">◀ Önceki Eser</div>
              <div className="font-serif font-bold text-base text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] mt-0.5">
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
            className="group bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4 text-right hover:border-[var(--accent)] hover:bg-[var(--surface-sub)] transition-colors sm:ml-auto w-full shadow-xs"
          >
            <div className="min-w-0 flex-1 text-left sm:text-right">
              <div className="text-xs font-black text-[var(--text-muted)] uppercase">Sonraki Eser ▶</div>
              <div className="font-serif font-bold text-base text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] mt-0.5">
                #{nextBook.sira_no} {nextBook.kitap_adi}
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>
    </div>
  );
}
