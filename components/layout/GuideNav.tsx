"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Users, Feather } from "lucide-react";

export default function GuideNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/seri-rehberi",
      label: "Alt Seriler",
      icon: Layers,
      isActive: pathname === "/seri-rehberi",
    },
    {
      href: "/yazarlar",
      label: "Yazarlar Atlası",
      icon: Users,
      isActive: pathname === "/yazarlar",
    },
    {
      href: "/cevirmenler",
      label: "Çevirmenler Atlası",
      icon: Feather,
      isActive: pathname === "/cevirmenler",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--surface-sub)] border border-[var(--border-main)] mb-8 w-fit">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              link.isActive
                ? "bg-[var(--surface-card)] text-[var(--accent)] shadow-xs border border-[var(--border-main)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)]/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${link.isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
