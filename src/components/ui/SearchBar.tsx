"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useSearch } from "@/lib/hooks/useSearch";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (query: string) => void;
  className?: string;
  compact?: boolean;
}

export function SearchBar({
  placeholder = "Search cities, places, landmarks…",
  autoFocus,
  onSelect,
  className,
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const { query, results, isSearching, recentSearches, search, commit, clear } = useSearch();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    search(e.target.value);
    setOpen(true);
  }

  function handleSubmit(q: string) {
    commit(q);
    setOpen(false);
    if (onSelect) {
      onSelect(q);
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      handleSubmit(query.trim());
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && (results.length > 0 || (recentSearches.length > 0 && !query));

  return (
    <div ref={containerRef} className={clsx("relative w-full", className)}>
      <div
        className={clsx(
          "flex items-center gap-2 bg-surface border border-border rounded-xl transition-all duration-150",
          open && "ring-2 ring-accent border-transparent",
          compact ? "h-9 px-3" : "h-11 px-4"
        )}
      >
        <Search className={clsx("text-text-tertiary flex-shrink-0", compact ? "w-4 h-4" : "w-4 h-4")} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={clsx(
            "flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none",
            compact ? "text-sm" : "text-sm"
          )}
        />
        {isSearching && (
          <span className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin flex-shrink-0" />
        )}
        {query && !isSearching && (
          <button
            onClick={() => { clear(); setOpen(false); }}
            className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-elevated z-50 overflow-hidden max-h-80 overflow-y-auto">
          {!query && recentSearches.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-tertiary px-3 pt-3 pb-1.5">Recent</p>
              {recentSearches.slice(0, 5).map((s, i) => (
                <button
                  key={i}
                  onClick={() => { search(s); handleSubmit(s); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors duration-100"
                >
                  <Clock className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                  <span className="text-sm text-text-primary">{s}</span>
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className={clsx(!query && recentSearches.length > 0 && "border-t border-border")}>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSubmit(result.name)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors duration-100"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{result.name}</p>
                    {result.address && (
                      <p className="text-xs text-text-tertiary truncate">{result.address.split(",").slice(0, 2).join(", ")}</p>
                    )}
                  </div>
                  <span className="text-xs text-text-tertiary capitalize flex-shrink-0">{result.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
