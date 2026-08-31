import { BookMarked } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-main)] bg-[var(--surface-card)]/40 py-10 mt-20 text-xs sm:text-sm text-[var(--text-muted)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-bold text-[var(--text-primary)]">İthaki Bilimkurgu Klasikleri (BKK)</span>
          <span>• Külliyat Takip &amp; Okuma Portalı</span>
        </div>
        
        <div>
          <span>Google Sheets ile Canlı Senkronize Dijital Kütüphane</span>
        </div>
      </div>
    </footer>
  );
}
