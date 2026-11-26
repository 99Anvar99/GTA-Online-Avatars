import type { Avatars, AvatarSlots } from "./avatars";

export interface RecentSearch {
  term: string;
  avatars: Avatars;
}

export const RECENT_SEARCH_LIMIT = 10;
const STORAGE_KEY = "recentSearches";

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value !== "" ? value : null;
}

function readSlots(value: unknown): AvatarSlots {
  const slots = readRecord(value);
  return {
    primary: readString(slots?.primary ?? value),
    secondary: readString(slots?.secondary),
  };
}

export function loadRecentSearches(): RecentSearch[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];

    const searches = new Map<string, RecentSearch>();
    for (const value of saved) {
      const entry = readRecord(value);
      const term = readString(entry?.term)?.trim();
      const avatars = readRecord(entry?.avatars);
      if (!term || !avatars || searches.has(term)) continue;

      searches.set(term, {
        term,
        avatars: {
          legacy: readSlots(avatars.legacy),
          enhanced: readSlots(avatars.enhanced),
          rid: readString(avatars.rid),
          username: readString(avatars.username),
        },
      });
      if (searches.size === RECENT_SEARCH_LIMIT) break;
    }
    return [...searches.values()];
  } catch {
    return [];
  }
}

export function saveRecentSearches(searches: RecentSearch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // History remains available for the current session.
  }
}
