"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, BarChart2, Users, Feather } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Kitaplık",
      icon: BookOpen,
      isActive: pathname === "/" || pathname.startsWith("/kitap/"),
    },
    {
      href: "/seri-rehberi",
      label: "Seriler",
      icon: Compass,
      isActive: pathname === "/seri-rehberi",
    },
    {
      href: "/yazarlar",
      label: "Yazarlar",
      icon: Users,
      isActive: pathname === "/yazarlar",
    },
    {
      href: "/cevirmenler",
      label: "Çevirmenler",
      icon: Feather,
      isActive: pathname === "/cevirmenler",
    },
    {
      href: "/istatistik",
      label: "İstatistik",
      icon: BarChart2,
      isActive: pathname === "/istatistik",
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-card)]/95 backdrop-blur-lg border-t border-[var(--border-main)] py-1.5 px-3 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-all py-1 px-2 rounded-xl ${
                item.isActive
                  ? "text-[var(--accent)] font-extrabold scale-105"
                  : "text-[var(--text-muted)] font-semibold hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[9px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
