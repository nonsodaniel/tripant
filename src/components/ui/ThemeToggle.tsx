"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { clsx } from "clsx";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={clsx(
        "flex items-center gap-1.5 rounded-lg p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors duration-150",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
