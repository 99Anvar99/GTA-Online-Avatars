"use client";
import React, { useState, useEffect } from "react";
import { Image } from "@heroui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

import type { Avatars } from "./api/lib/rockstar";

interface RecentSearch {
  term: string;
  avatars: Avatars;
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [avatars, setAvatars] = useState<Avatars>({
    legacy: null,
    enhanced: null,
    rid: null,
    username: null,
  });
  const [status, setStatus] = useState("");
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecent(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever recent changes
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recent));
  }, [recent]);

  const handleSearch = async (term?: string) => {
    const searchTerm = String(term ?? input).trim();
    if (!searchTerm) return;

    setInput(searchTerm);
    setStatus("🔎 Searching...");
    setSearched(true);

    try {
      const res = await fetch(`/api/rockstar?player=${searchTerm}`);
      const data: Avatars = await res.json();
      setAvatars(data);

      if (!data.legacy && !data.enhanced) {
        setStatus("❌ No avatars found");
      } else {
        setStatus("✅ Avatars loaded");
      }

      // Update recent searches (max 10, unique by term)
      setRecent((prev) => {
        const updated = [
          { term: searchTerm, avatars: data },
          ...prev.filter((p) => p.term !== searchTerm),
        ];
        return updated.slice(0, 10);
      });
    } catch {
      setStatus("❌ Failed to fetch");
    }
  };

  const removeSearch = (termToRemove: string) => {
    setRecent((prev) => prev.filter((r) => r.term !== termToRemove));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-6 relative">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          GTA 5 Online Player Avatar Lookup
        </h1>
        <p className="text-gray-300 mt-2 font-bold">
          Legacy & Enhanced Edition
        </p>
      </div>

      {/* Input */}
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="text"
          placeholder="Enter Username or RID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="button" onClick={() => handleSearch()} variant="outline">
          Search
        </Button>
      </div>

      {/* Avatars */}
      <div className="flex gap-6 mt-8">
        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-400 mb-2">Legacy</p>
          {avatars.legacy ? (
            <Image
              src={avatars.legacy}
              alt="Legacy Avatar"
              className="w-32 h-32 border-2 border-blue-600 rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              No Legacy Avatar
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-400 mb-2">
            Enhanced Edition
          </p>
          {avatars.enhanced ? (
            <Image
              src={avatars.enhanced}
              alt="Enhanced Avatar"
              className="w-32 h-32 border-2 border-green-600 rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              No Enhanced Avatar
            </div>
          )}
        </div>
      </div>

      {/* RID/Username */}
      {searched && (
        <p className="mt-4 text-sm text-gray-400">
          {avatars.rid && /^\d+$/.test(input)
            ? `Username: ${avatars.username || "Unknown"}`
            : `RID: ${avatars.rid || "Unknown"}`}
        </p>
      )}

      {/* Status */}
      <p className="mt-2 text-sm text-gray-400">{status}</p>

      {/* Recent Searches */}
      {recent.length > 0 && (
        <aside className="mt-10 lg:mt-0 lg:absolute lg:top-20 lg:right-6 w-full lg:w-72">
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-4">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 flex justify-between items-center">
              Recent Searches
              <span className="text-xs text-gray-400">
                {recent.length} / 10
              </span>
            </h2>

            {/* Desktop (vertical list) */}
            <ul className="hidden lg:flex lg:flex-col lg:space-y-3">
              {recent.map((r) => (
                <li key={r.term} className="flex items-center justify-between">
                  <button
                    onClick={() => handleSearch(r.term)}
                    className="flex items-center gap-3 w-full text-left bg-gray-800/70 hover:bg-gray-700 hover:scale-[1.02] transition rounded-xl p-2"
                  >
                    <div className="flex gap-1">
                      {r.avatars.legacy ? (
                        <Image
                          src={r.avatars.legacy}
                          alt="Legacy"
                          className="w-10 h-10 rounded-lg border border-blue-600 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          N/A
                        </div>
                      )}
                      {r.avatars.enhanced ? (
                        <Image
                          src={r.avatars.enhanced}
                          alt="Enhanced"
                          className="w-10 h-10 rounded-lg border border-green-600 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {r.term}
                      </p>
                      <p className="text-xs text-gray-400">
                        RID: {r.avatars.rid || "Unknown"}
                      </p>
                    </div>
                  </button>
                  {/* Trash icon */}
                  <button
                    onClick={() => removeSearch(r.term)}
                    className="ml-2 p-1  text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile (horizontal scroll) */}
            <div className="flex lg:hidden overflow-x-auto gap-3">
              {recent.map((r) => (
                <div key={r.term} className="relative flex-shrink-0">
                  <button
                    onClick={() => handleSearch(r.term)}
                    className="bg-gray-800/70 hover:bg-gray-700 rounded-xl p-2 flex flex-col items-center w-28"
                  >
                    <div className="flex gap-1 mb-2">
                      {r.avatars.legacy ? (
                        <Image
                          src={r.avatars.legacy}
                          alt="Legacy"
                          className="w-10 h-10 rounded-lg border border-blue-600 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          N/A
                        </div>
                      )}
                      {r.avatars.enhanced ? (
                        <Image
                          src={r.avatars.enhanced}
                          alt="Enhanced"
                          className="w-10 h-10 rounded-lg border border-green-600 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          N/A
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-white truncate w-full text-center">
                      {r.term}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                      RID: {r.avatars.rid || "Unknown"}
                    </p>
                  </button>

                  {/* Trash icon for mobile */}
                  <button
                    onClick={() => removeSearch(r.term)}
                    className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 transition rounded-full bg-gray-900/50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Footer */}
      <footer className="absolute bottom-4 text-center w-full text-gray-500 text-xs">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/99Anvar99"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mister9982
          </a>
        </p>
        <p>Data sourced from Rockstar&apos;s official services.</p>
      </footer>
    </main>
  );
}