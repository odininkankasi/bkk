import { Book } from "@/lib/sheets";
import { CheckCircle2, Clock, Bookmark, Calendar, MessageSquareQuote } from "lucide-react";

interface Props {
  book: Book;
}

export default function ReadingPanel({ book }: Props) {
  const isRead = book.okundu === "Evet";
  const isOwned = book.kitaplikta_var === "Evet";
  const rating = book.puan || 0;
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "Puan Verilmedi";

  // Okuma tarihleri
  let dateText = "—";
  if (book.tarih_1 && book.tarih_2) dateText = `${book.tarih_1} – ${book.tarih_2}`;
  else if (book.tarih_1) dateText = book.tarih_1;
  else if (book.tarih_2) dateText = book.tarih_2;

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-5 sm:p-6 mb-8 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--accent)] mb-4">
        <Bookmark className="w-4 h-4" />
        <span>Kişisel Okuma &amp; Kitaplık Durumu</span>
      </div>

      {/* 4'lü Metrik Izgarası */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Okuma Durumu */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Okuma Durumu</div>
          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
            {isRead ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[var(--read-tag-text)]">✓ Okundu</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-[var(--text-muted)]">⌛ Okunacak</span>
              </>
            )}
          </div>
        </div>

        {/* Kitaplık Durumu */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Kitaplıkta</div>
          <div className="mt-1 font-bold text-sm">
            {isOwned ? (
              <span className="text-[var(--owned-tag-text)]">📚 Kitaplıkta Var</span>
            ) : (
              <span className="text-[var(--text-muted)]">🛒 Kitaplıkta Yok</span>
            )}
          </div>
        </div>

        {/* Puanım */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Puanım</div>
          <div className="mt-1 font-bold text-sm text-[var(--gold)] font-serif tracking-tighter">
            {stars}
          </div>
        </div>

        {/* Okuma Tarihi */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Okuma Tarihi</span>
          </div>
          <div className="mt-1 font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate">
            {dateText}
          </div>
        </div>
      </div>

      {/* Kişisel Yorum / Okuma Notu */}
      {book.kisisel_yorum && (
        <div className="mt-4 pt-4 border-t border-[var(--border-main)]">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <MessageSquareQuote className="w-4 h-4 text-[var(--accent)]" />
            <span>Kişisel Okuma Notum &amp; Yorumum:</span>
          </div>
          <p className="font-serif italic text-[var(--text-primary)] text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-[var(--accent)]">
            "{book.kisisel_yorum}"
          </p>
        </div>
      )}
    </div>
  );
}
