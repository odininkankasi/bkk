import Link from "next/link";
import { BookMarked } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/40 py-10 mt-20 text-xs text-stone-500 dark:text-stone-400">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-amber-700 dark:text-amber-500" />
          <span className="font-semibold text-stone-700 dark:text-stone-300">İthaki Bilimkurgu Klasikleri (BKK)</span>
          <span>• 116 Ciltlik Külliyat Takip Portalı</span>
        </div>
        
        <div>
          <span>Google Sheets ile Senkronize Dijital Kütüphane</span>
        </div>
      </div>
    </footer>
  );
}
