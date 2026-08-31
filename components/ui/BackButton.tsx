"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  label?: string;
  fallbackHref?: string;
}

export default function BackButton({ label = "Geri", fallbackHref = "/" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold text-[var(--text-primary)] bg-[var(--surface-card)] border border-[var(--border-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-xs cursor-pointer group"
      title="Önceki Sayfaya Dön"
    >
      <ArrowLeft className="w-4 h-4 text-[var(--accent)] group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
}
