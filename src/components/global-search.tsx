"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiSearch, HiX } from "react-icons/hi";

interface SearchResult {
  id: string;
  type: "project" | "todo" | "note";
  label: string;
  sublabel: string;
  href: string;
  matchField: string;
  matchReason: string;
}

const TYPE_STYLES: Record<string, string> = {
  project: "text-accent bg-accent/10 border-accent/20",
  todo: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  note: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function navigate(result: SearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  }

  function highlightText(text: string, queryStr: string) {
    if (!queryStr.trim()) return text;
    const idx = text.toLowerCase().indexOf(queryStr.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-accent font-medium">{text.slice(idx, idx + queryStr.length)}</span>
        {text.slice(idx + queryStr.length)}
      </>
    );
  }

  return (
    <div className="relative">
      {/* Search bar */}
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-muiz-400 hover:text-muiz-300 hover:border-white/20 transition-all duration-200 text-sm min-w-[200px]"
      >
        <HiSearch className="w-4 h-4 shrink-0" />
        <span className="hidden lg:inline text-muiz-500">Search...</span>
        <span className="hidden sm:inline lg:hidden text-muiz-500">Search...</span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-muiz-500 border border-white/10 rounded px-1.5 py-0.5">
          <span className="text-[9px]">⌘</span>K
        </span>
      </button>

      {/* Expanded search input */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setQuery("");
              setResults([]);
            }}
          />

          {/* Search panel */}
          <div
            ref={panelRef}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 animate-fade-in-up"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <HiSearch className="w-5 h-5 text-muiz-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, tasks, notes..."
                  className="flex-1 bg-transparent text-white text-base placeholder:text-muiz-500 focus:outline-none"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded text-muiz-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[10px] font-mono text-muiz-500 border border-white/10 rounded px-1.5 py-0.5 hidden sm:inline-flex items-center gap-0.5">
                  ESC
                </span>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading && (
                  <div className="p-6 text-center">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}

                {!loading && query.trim() && results.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muiz-400">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-muiz-500 mt-1">Try a different search term</p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => navigate(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                          index === selectedIndex
                            ? "bg-white/5"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Type badge */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border shrink-0 mt-0.5 ${
                              TYPE_STYLES[result.type] || "text-muiz-300 bg-white/5 border-white/10"
                            }`}
                          >
                            {result.type}
                          </span>

                          <div className="min-w-0 flex-1">
                            {/* Title */}
                            <div className="text-sm font-medium text-white truncate">
                              {highlightText(result.label, query)}
                            </div>

                            {/* Sublabel */}
                            <div className="text-[11px] text-muiz-400 mt-0.5">
                              {highlightText(result.sublabel, query)}
                            </div>

                            {/* Match reason */}
                            {result.matchReason && (
                              <div className="text-[11px] text-muiz-500 mt-1 line-clamp-2">
                                {highlightText(result.matchReason, query)}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Footer */}
                    <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-muiz-500">
                      <span className="flex items-center gap-1">
                        <span className="text-[9px]">↑↓</span> Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[9px]">⏎</span> Open
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[9px]">ESC</span> Close
                      </span>
                    </div>
                  </div>
                )}

                {!loading && !query.trim() && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muiz-500">
                      Type to search projects, tasks, and notes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
