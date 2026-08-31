import Link from "next/link";
import { Book } from "@/lib/sheets";

interface Props {
  book: Book;
}

export default function BookListRow({ book }: Props) {
  const isRead = book.okundu === "Evet";
  const isOwned = book.kitaplikta_var === "Evet";
  const rating = book.puan || 0;
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
  const cover = book.kapak_gorseli || "/icon.png";
  const no = book.sira_no ? "#" + String(book.sira_no).padStart(2, "0") : "—";

  return (
    <Link
      href={`/kitap/${book.slug}`}
      className="group bg-[var(--surface-card)] border border-[var(--border-main)] rounded-xl p-3 sm:p-3.5 flex items-center gap-3.5 sm:gap-4 hover:border-[var(--accent)] hover:bg-[var(--surface-sub)] transition-all duration-150 shadow-xs"
    >
      {/* Numara */}
      <div className="font-extrabold text-sm sm:text-base text-[var(--text-muted)] min-w-[32px] sm:min-w-[38px] text-center font-mono">
        {no}
      </div>

      {/* Küçük Kapak Görseli */}
      <div className="w-10 sm:w-11 h-14 sm:h-16 rounded overflow-hidden bg-[var(--surface-sub)] flex-shrink-0 border border-black/5 dark:border-white/5">
        <img
          src={cover}
          alt={book.kitap_adi}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>

      {/* Kitap & Yazar Bilgisi */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors leading-tight">
          {book.kitap_adi}
        </div>
        <div className="text-xs sm:text-sm text-[var(--text-secondary)] truncate mt-0.5 font-medium">
          {book.yazar_adi}
        </div>
      </div>

      {/* Sağ Rozetler & Yıldızlar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {stars && (
          <div className="hidden md:block text-[var(--gold)] text-xs sm:text-sm tracking-tighter font-serif">
            {stars}
          </div>
        )}

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${
            isRead
              ? "bg-[var(--read-tag-bg)] text-[var(--read-tag-text)] border border-emerald-300 dark:border-emerald-800"
              : "bg-[var(--unread-tag-bg)] text-[var(--unread-tag-text)] border border-[var(--border-sub)]"
          }`}
        >
          {isRead ? "✓ Okundu" : "⌛ Okunacak"}
        </span>

        {isOwned && (
          <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-1 rounded-md bg-[var(--owned-tag-bg)] text-[var(--owned-tag-text)] border border-blue-300 dark:border-blue-800 whitespace-nowrap">
            📚 Kitaplıkta
          </span>
        )}
      </div>
    </Link>
  );
}
