"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Briefcase, Bookmark, History, CalendarDays } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/map", label: "Map", icon: Map },
  { href: "/trips", label: "Trips", icon: Briefcase },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/history", label: "History", icon: History },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="hidden lg:flex sticky top-0 z-40 bg-surface border-b border-border h-14 items-center px-6 gap-6">
      <Link href="/explore" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <Compass className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-text-primary text-base">Tripant</span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 max-w-xs ml-auto">
        <SearchBar compact />
      </div>
    </header>
  );
}
