"use client";

import { useState } from "react";
import { Book } from "@/lib/sheets";
import { exportBooksToCSV } from "@/lib/utils";
import { FileSpreadsheet, Check } from "lucide-react";

interface Props {
  books: Book[];
}

export default function ExcelExportButton({ books }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    exportBooksToCSV(books, "ithaki-bilimkurgu-klasikleri-tam-liste.csv");
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[var(--border-main)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-xs cursor-pointer"
      title="Tüm BKK serisini Excel olarak indir"
    >
      {downloaded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel İndirildi!</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Excel İndir (.csv)</span>
        </>
      )}
    </button>
  );
}
