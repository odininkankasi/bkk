"use client";

import { useState } from "react";
import { Book } from "@/lib/sheets";
import { exportBooksToCSV } from "@/lib/utils";
import { Download, FileSpreadsheet, Check } from "lucide-react";

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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-xs cursor-pointer"
      title="Tüm BKK serisini Excel olarak indir"
    >
      {downloaded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Excel İndirildi!</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Excel İndir (.csv)</span>
        </>
      )}
    </button>
  );
}
