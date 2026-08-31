"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("bkk_theme") as "light" | "dark") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("bkk_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--border-main)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-all shadow-xs cursor-pointer"
      title="Temayı Değiştir"
    >
      {theme === "light" ? (
        <>
          <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Karanlık Mod</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Sepya Mod</span>
        </>
      )}
    </button>
  );
}
