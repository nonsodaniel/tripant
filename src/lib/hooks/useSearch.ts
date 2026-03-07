"use client";

import { useState, useCallback, useRef } from "react";
import type { SearchResult } from "@/types";
import { useSavedStore } from "@/lib/store/useSavedStore";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { recentSearches, addRecentSearch } = useSavedStore();

  const search = useCallback((q: string) => {
    setQuery(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: q.trim() });
        const res = await fetch(`/api/search?${params}`);
        if (!res.ok) throw new Error("Search failed");
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }, []);

  const commit = useCallback((q: string) => {
    if (q.trim()) addRecentSearch(q.trim());
  }, [addRecentSearch]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    isSearching,
    error,
    recentSearches,
    search,
    commit,
    clear,
  };
}
