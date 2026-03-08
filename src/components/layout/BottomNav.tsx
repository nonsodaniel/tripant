"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Briefcase, Bookmark, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/map", label: "Map", icon: Map },
  { href: "/trips", label: "Trips", icon: Briefcase },
  { href: "/saved", label: "Saved", icon: Bookmark },
];

export function BottomNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border lg:hidden">
      <div className="flex items-stretch h-16 safe-area-pb">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150",
                active ? "text-accent" : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* Dark mode toggle as the 5th tab */}
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex-1 flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-text-secondary transition-colors duration-150"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" strokeWidth={1.75} />
          ) : (
            <Moon className="w-5 h-5" strokeWidth={1.75} />
          )}
          <span className="text-[10px] font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>
    </nav>
  );
}
