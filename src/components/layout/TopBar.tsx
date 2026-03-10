"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Briefcase, Bookmark, History, CalendarDays, MapPin, ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLocationStore } from "@/lib/store/useLocationStore";
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
  const { city, isLocating, openLocationPicker } = useLocationStore();

  return (
    <header className="hidden lg:flex sticky top-0 z-40 bg-surface border-b border-border h-14 items-center px-6 gap-6">
      {/* Logo */}
      <Link href="/explore" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <Compass className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-text-primary text-base">Tripant</span>
      </Link>

      {/* Location button */}
      <button
        onClick={openLocationPicker}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-accent hover:bg-accent-light
                   active:scale-95 transition-all duration-150 flex-shrink-0 group"
        aria-label="Change location"
      >
        <MapPin className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent transition-colors duration-150" />
        <span className="text-sm text-text-secondary group-hover:text-accent transition-colors duration-150 max-w-[120px] truncate">
          {isLocating ? "Locating…" : city ?? "Set location"}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent transition-colors duration-150" />
      </button>

      {/* Nav links */}
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

      {/* Right: search + theme toggle */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-56">
          <SearchBar compact />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
