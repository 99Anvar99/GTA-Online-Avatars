"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isRockstarId, type Avatars, type AvatarSlots } from "@/lib/avatars";
import {
  loadRecentSearches,
  RECENT_SEARCH_LIMIT,
  saveRecentSearches,
  type RecentSearch,
} from "@/lib/recent-searches";

const EDITIONS = [
  { key: "legacy", label: "Legacy Edition", border: "border-blue-600" },
  { key: "enhanced", label: "Enhanced Edition", border: "border-green-600" },
] as const;

const STATUS_MESSAGES = {
  idle: "",
  loading: "🔎 Searching…",
  error: "❌ Failed to fetch avatars",
  empty: "❌ No avatars found",
  ready: "✅ Avatars loaded",
};

type SearchState =
  | { status: "idle" | "loading" | "error" }
  | { status: "empty" | "ready"; result: RecentSearch };

type Edition = (typeof EDITIONS)[number];

function AvatarImage({ alt, ...props }: ComponentProps<"img"> & { alt: string }) {
  // Avatars are already small CDN PNGs. Load them directly in the browser.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={alt} decoding="async" />;
}

function EditionAvatar({ edition, slots }: { edition: Edition; slots?: AvatarSlots }) {
  const [showSecond, setShowSecond] = useState(false);
  const hasSecond = Boolean(slots?.secondary && slots.secondary !== slots.primary);
  const avatar = showSecond ? slots?.secondary : slots?.primary;

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-2 text-sm font-semibold text-gray-400">{edition.label}</h2>
      {avatar ? (
        <AvatarImage
          src={avatar}
          alt={`${edition.label} avatar, character ${showSecond || avatar === slots?.secondary ? 2 : 1}`}
          width={128}
          height={128}
          className={`size-32 rounded-lg border-2 object-cover ${edition.border}`}
        />
      ) : (
        <div className="flex size-32 items-center justify-center rounded-lg border border-gray-700 bg-gray-800/80 p-2 text-center text-xs text-gray-400">
          No {edition.label} avatar
        </div>
      )}
      {hasSecond && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-2 text-xs text-gray-400 hover:text-white"
          onClick={() => setShowSecond((value) => !value)}
        >
          {showSecond ? "👤 Show Character 1" : "👥 Show Character 2"}
        </Button>
      )}
    </div>
  );
}

function RecentSearchList({
  searches,
  onSearch,
  onRemove,
}: {
  searches: RecentSearch[];
  onSearch: (term: string) => void;
  onRemove: (term: string) => void;
}) {
  return (
    <aside className="mt-10 w-full min-w-0 rounded-2xl border border-gray-700 bg-gray-900/70 p-4 shadow-2xl xl:col-start-3 xl:row-start-1 xl:mt-0 xl:max-w-72 xl:justify-self-end">
      <h2 className="mb-4 flex items-center justify-between gap-2 border-b border-gray-700 pb-2 text-lg font-bold text-white">
        Recent Searches
        <span className="shrink-0 text-xs text-gray-400">
          {searches.length} / {RECENT_SEARCH_LIMIT}
        </span>
      </h2>
      <ul className="flex gap-3 overflow-x-auto xl:max-h-96 xl:flex-col xl:overflow-y-auto">
        {searches.map(({ term, avatars }) => (
          <li key={term} className="relative flex w-28 shrink-0 items-center gap-2 xl:w-full">
            <button
              type="button"
              onClick={() => onSearch(term)}
              className="flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl bg-gray-800/70 p-2 text-center transition hover:bg-gray-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-400 xl:flex-row xl:text-left"
            >
              <span className="flex shrink-0 gap-1">
                {EDITIONS.map(({ key, label, border }) => {
                  const avatar = avatars[key].primary;
                  return avatar ? (
                    <AvatarImage
                      key={key}
                      src={avatar}
                      alt={label}
                      width={40}
                      height={40}
                      loading="lazy"
                      className={`size-10 rounded-lg border object-cover ${border}`}
                    />
                  ) : (
                    <span
                      key={key}
                      aria-label={`${label} avatar unavailable`}
                      className="flex size-10 items-center justify-center rounded-lg bg-gray-600 text-xs text-gray-300"
                    >
                      N/A
                    </span>
                  );
                })}
              </span>
              <span className="w-full min-w-0">
                <span className="block truncate text-xs font-semibold text-white xl:text-sm">
                  {term}
                </span>
                <span className="block truncate text-xs text-gray-400">
                  RID: {avatars.rid ?? "Unknown"}
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-label={`Remove ${term} from recent searches`}
              onClick={() => onRemove(term)}
              className="absolute top-0.5 right-0.5 rounded-full bg-gray-900/85 p-1 text-gray-300 transition hover:text-red-400 focus-visible:outline-2 focus-visible:outline-gray-400 xl:static"
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function AvatarSearch() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [recent, setRecent] = useState<RecentSearch[] | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    setRecent(loadRecentSearches());
    return () => activeRequest.current?.abort();
  }, []);

  useEffect(() => {
    if (recent !== null) saveRecentSearches(recent);
  }, [recent]);

  async function handleSearch(term: string) {
    const player = term.trim();
    if (!player) return;

    activeRequest.current?.abort();
    const request = new AbortController();
    activeRequest.current = request;
    setInput(player);
    setSearch({ status: "loading" });

    try {
      const query = new URLSearchParams({ player });
      const response = await fetch(`/api/rockstar?${query}`, { signal: request.signal });
      if (!response.ok) throw new Error(`Lookup returned HTTP ${response.status}`);

      const avatars: Avatars = await response.json();
      if (request.signal.aborted) return;

      const result = { term: player, avatars };
      const status = avatars.legacy.primary || avatars.enhanced.primary ? "ready" : "empty";
      setSearch({ status, result });
      setRecent((previous) =>
        [result, ...(previous ?? []).filter((entry) => entry.term !== player)].slice(
          0,
          RECENT_SEARCH_LIMIT,
        ),
      );
    } catch {
      if (!request.signal.aborted) setSearch({ status: "error" });
    } finally {
      if (activeRequest.current === request) activeRequest.current = null;
    }
  }

  const result = "result" in search ? search.result : null;

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)_minmax(0,1fr)] xl:items-start xl:gap-x-6">
      <div className="xl:col-start-2">
        <form
          className="mx-auto flex w-full max-w-sm items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSearch(input);
          }}
        >
          <label htmlFor="player" className="sr-only">Username or RID</label>
          <Input
            id="player"
            type="text"
            placeholder="Enter Username or RID"
            value={input}
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" variant="outline" disabled={!input.trim()}>
            Search
          </Button>
        </form>

        <div
          key={result?.term ?? ""}
          className="mt-10 flex flex-wrap justify-center gap-8"
        >
          {EDITIONS.map((edition) => (
            <EditionAvatar key={edition.key} edition={edition} slots={result?.avatars[edition.key]} />
          ))}
        </div>

        {result && (
          <p className="mt-4 text-center text-sm text-gray-400">
            {isRockstarId(result.term)
              ? `Username: ${result.avatars.username ?? "Unknown"}`
              : `RID: ${result.avatars.rid ?? "Unknown"}`}
          </p>
        )}
        <p role="status" className="mt-2 min-h-5 text-center text-sm text-gray-400">
          {STATUS_MESSAGES[search.status]}
        </p>
      </div>

      {recent && recent.length > 0 && (
        <RecentSearchList
          searches={recent}
          onSearch={handleSearch}
          onRemove={(term) => setRecent((previous) =>
            previous?.filter((entry) => entry.term !== term) ?? [],
          )}
        />
      )}
    </div>
  );
}
