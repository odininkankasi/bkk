import { Book } from "@/lib/sheets";
import { CheckCircle2, Clock, Bookmark, Calendar, MessageSquareQuote, PlayCircle, CheckCircle } from "lucide-react";

interface Props {
  book: Book;
}

export default function ReadingPanel({ book }: Props) {
  const isRead = book.okundu === "Evet";
  const isOwned = book.kitaplikta_var === "Evet";
  const rating = book.puan || 0;
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : "Puan Verilmedi";

  const startDate = book.tarih_1?.trim();
  const endDate = book.tarih_2?.trim();
  const hasDates = Boolean(startDate || endDate);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-main)] rounded-2xl p-5 sm:p-7 mb-8 shadow-xs">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--accent)] mb-4">
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Kişisel Okuma &amp; Kitaplık Durumu</span>
      </div>

      {/* ── 1. Satır: Durum, Kitaplık ve Puan Kartları ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
        {/* Okuma Durumu */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Okuma Durumu</div>
          <div className="flex items-center gap-1.5 mt-1.5 font-bold text-sm sm:text-base">
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
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Kitaplıkta</div>
          <div className="mt-1.5 font-bold text-sm sm:text-base">
            {isOwned ? (
              <span className="text-[var(--owned-tag-text)]">📚 Kitaplıkta Var</span>
            ) : (
              <span className="text-[var(--text-muted)]">🛒 Kitaplıkta Yok</span>
            )}
          </div>
        </div>

        {/* Puanım */}
        <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-3.5">
          <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Puanım</div>
          <div className="mt-1.5 font-bold text-sm sm:text-base text-[var(--gold)] font-serif tracking-tighter">
            {stars}
          </div>
        </div>
      </div>

      {/* ── 2. Satır: Okuma Tarihleri (Başlangıç ve Bitiş - Geniş ve Net Görünüm) ── */}
      <div className="bg-[var(--surface-sub)] border border-[var(--border-main)] rounded-xl p-4 mb-4">
        <div className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5 mb-2.5">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <span>Okuma Süreci &amp; Tarihleri</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tarih 1: Okumaya Başlangıç */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-[var(--surface-card)] border border-[var(--border-main)] rounded-lg p-2.5">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Başlangıç Tarihi:</span>
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-[var(--text-primary)]">
              {startDate || "—"}
            </span>
          </div>

          {/* Tarih 2: Okuma Bitiş */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-[var(--surface-card)] border border-[var(--border-main)] rounded-lg p-2.5">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Bitiş Tarihi:</span>
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-[var(--text-primary)]">
              {endDate || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Satır: Kişisel Yorum / Okuma Notu ── */}
      {book.kisisel_yorum && (
        <div className="pt-4 border-t border-[var(--border-main)]">
          <div className="text-xs sm:text-sm font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2 mb-2.5">
            <MessageSquareQuote className="w-5 h-5 text-[var(--accent)]" />
            <span>Kişisel Okuma Notum &amp; Yorumum:</span>
          </div>
          <p className="font-serif italic text-[var(--text-primary)] text-base sm:text-lg leading-relaxed pl-3.5 border-l-3 border-[var(--accent)]">
            "{book.kisisel_yorum}"
          </p>
        </div>
      )}
    </div>
  );
}
