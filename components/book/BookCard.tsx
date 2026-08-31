import Link from "next/link";
import { Book } from "@/lib/sheets";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const isRead = book.okundu === "Evet";
  const rating = book.puan || 0;
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
  const isUpcoming = book.sira_no === "Yakında" || !book.sira_no || isNaN(Number(book.sira_no));
  const no = isUpcoming ? "Yakında" : "#" + String(book.sira_no).padStart(2, "0");
  const cover = book.kapak_gorseli || "/icon.png";

  // Uzun başlıklar için akıllı tipografi optimizasyonu
  const titleLen = book.kitap_adi?.length || 0;
  const isVeryLong = titleLen > 24;
  const isLong = titleLen > 18;

  const titleFontSize = isVeryLong
    ? "text-[12.5px] sm:text-[13.5px] leading-snug tracking-tight"
    : isLong
    ? "text-[13.5px] sm:text-[14.5px] leading-snug tracking-tight"
    : "text-[15px] sm:text-base leading-tight";

  return (
    <Link
      href={`/kitap/${book.slug}`}
      className="group bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-3 flex flex-col hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[var(--surface-sub)] mb-3 border border-black/5 dark:border-white/5">
        <img
          src={cover}
          alt={book.kitap_adi}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Seri No Rozeti */}
        <div
          className={`absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded shadow-sm backdrop-blur-xs font-mono ${
            isUpcoming ? "bg-amber-600 text-white" : "bg-[#14100c]/90 text-[#faf4e6]"
          }`}
        >
          {no}
        </div>
        {/* Okundu Rozeti */}
        <div
          className={`absolute bottom-2 right-2 text-[11px] font-extrabold px-2 py-0.5 rounded shadow-sm ${
            isUpcoming
              ? "bg-amber-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-xs"
              : isRead
              ? "bg-[var(--read-tag-text)] text-white"
              : "bg-[#14100c]/90 text-[#faf4e6] backdrop-blur-xs"
          }`}
        >
          {isUpcoming ? "✨ Yakında" : isRead ? "✓ Okundu" : "⌛ Okunacak"}
        </div>
      </div>

      {/* Kitap Başlığı (Akıllı Font Ölçekleme & Tam Görünürlük) */}
      <div
        className={`font-serif font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-3 min-h-[3rem] sm:min-h-[3.3rem] flex items-start break-words hyphens-auto ${titleFontSize}`}
        title={book.kitap_adi}
      >
        {book.kitap_adi}
      </div>

      {/* Yazar Adı */}
      <div className="text-xs sm:text-[13px] text-[var(--text-secondary)] font-semibold truncate mt-1">
        {book.yazar_adi}
      </div>

      {/* Yıldız Değerlendirmesi */}
      {stars && (
        <div className="text-[var(--gold)] text-sm font-bold mt-auto pt-1.5 tracking-tighter font-serif">
          {stars}
        </div>
      )}
    </Link>
  );
}
