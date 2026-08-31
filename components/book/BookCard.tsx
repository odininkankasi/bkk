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
      className="group bg-white dark:bg-[#131720] border border-[#e7e2d7] dark:border-[#232a36] rounded-xl p-2.5 flex flex-col hover:border-amber-800/40 dark:hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200 shadow-xs hover:shadow-md"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#f3efe6] dark:bg-[#1a202c] mb-2.5 border border-black/5 dark:border-white/5">
        <img
          src={cover}
          alt={book.kitap_adi}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Seri No Rozeti */}
        <div className="absolute top-1.5 left-1.5 bg-stone-950/85 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-xs">
          {no}
        </div>
        {/* Okundu Rozeti */}
        <div
          className={`absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
            isRead
              ? "bg-emerald-700 text-white"
              : "bg-stone-900/85 text-stone-300 backdrop-blur-xs"
          }`}
        >
          {isRead ? "✓ Okundu" : "⌛ Okunacak"}
        </div>
      </div>

      <div className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors min-h-[2.4em]">
        {book.kitap_adi}
      </div>

      <div className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5 font-medium">
        {book.yazar_adi}
      </div>

      {stars && (
        <div className="text-amber-600 dark:text-amber-400 text-xs mt-auto pt-1 tracking-tighter font-serif">
          {stars}
        </div>
      )}
    </Link>
  );
}
