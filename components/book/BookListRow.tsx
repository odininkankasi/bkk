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
      className="group bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3.5 sm:gap-4 hover:border-amber-700/40 dark:hover:border-amber-500/40 hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-all duration-150 shadow-xs"
    >
      {/* Numara */}
      <div className="font-extrabold text-sm sm:text-base text-stone-400 dark:text-stone-500 min-w-[32px] sm:min-w-[38px] text-center font-mono">
        {no}
      </div>

      {/* Küçük Kapak Görseli */}
      <div className="w-10 sm:w-11 h-14 sm:h-16 rounded overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 border border-black/5 dark:border-white/5">
        <img
          src={cover}
          alt={book.kitap_adi}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>

      {/* Kitap & Yazar Bilgisi */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors leading-tight">
          {book.kitap_adi}
        </div>
        <div className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 truncate mt-0.5 font-medium">
          {book.yazar_adi}
        </div>
      </div>

      {/* Sağ Rozetler & Yıldızlar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {stars && (
          <div className="hidden md:block text-amber-500 dark:text-amber-400 text-xs sm:text-sm tracking-tighter font-serif">
            {stars}
          </div>
        )}

        <span
          className={`text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${
            isRead
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : "bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
          }`}
        >
          {isRead ? "✓ Okundu" : "⌛ Okunacak"}
        </span>

        {isOwned && (
          <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 whitespace-nowrap">
            📚 Kitaplıkta
          </span>
        )}
      </div>
    </Link>
  );
}
