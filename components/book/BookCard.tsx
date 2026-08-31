import Link from "next/link";
import { Book } from "@/lib/sheets";

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const isRead = book.okundu === "Evet";
  const rating = book.puan || 0;
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
  const cover = book.kapak_gorseli || "/icon.png";
  const no = book.sira_no ? "#" + String(book.sira_no).padStart(2, "0") : "";

  return (
    <Link
      href={`/kitap/${book.slug}`}
      className="group bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-2.5 flex flex-col hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[var(--surface-sub)] mb-2.5 border border-black/5 dark:border-white/5">
        <img
          src={cover}
          alt={book.kitap_adi}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Seri No Rozeti */}
        <div className="absolute top-1.5 left-1.5 bg-[#17130f]/85 text-[#f2ebd9] text-[11px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-xs">
          {no}
        </div>
        {/* Okundu Rozeti */}
        <div
          className={`absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
            isRead
              ? "bg-[var(--read-tag-text)] text-white"
              : "bg-[#17130f]/85 text-[#cfc1aa] backdrop-blur-xs"
          }`}
        >
          {isRead ? "✓ Okundu" : "⌛ Okunacak"}
        </div>
      </div>

      <div className="font-serif font-semibold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors min-h-[2.4em]">
        {book.kitap_adi}
      </div>

      <div className="text-xs text-[var(--text-muted)] truncate mt-0.5 font-medium">
        {book.yazar_adi}
      </div>

      {stars && (
        <div className="text-[var(--gold)] text-xs mt-auto pt-1 tracking-tighter font-serif">
          {stars}
        </div>
      )}
    </Link>
  );
}
