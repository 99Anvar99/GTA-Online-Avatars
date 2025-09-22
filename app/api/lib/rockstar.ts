// app/api/lib/rockstar.ts
import fetch from "node-fetch";

interface Avatars {
  legacy: string | null;
  enhanced: string | null;
  rid: string | null;
}

/**
 * Fetch avatars (Legacy & Enhanced) and RID for a given player (username or RID)
 */
export async function fetchAvatars(player: string): Promise<Avatars> {
  let rid: string | null = null;

  // Auto-detect: if player is all numbers, treat as RID
  if (/^\d+$/.test(player)) {
    rid = player;
  } else {
    // Fetch RID from username
    try {
      const resp = await fetch(`https://sc-cache.com/n/${player}`);
      if (resp.ok) {
        const data = await resp.json();
        rid = data?.id?.toString() || null;
      }
    } catch (err) {
      console.error("Failed to fetch RID from username:", err);
    }
  }

  if (!rid) {
    return { legacy: null, enhanced: null, rid: null };
  }

  // Construct avatar URLs
  const legacyUrl = `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/0.png`;
  const enhancedUrl = `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/0_pcrosalt.png`;

  // Helper to check if image exists
  const checkImage = async (url: string): Promise<string | null> => {
    try {
      const resp = await fetch(url, { method: "HEAD" });
      return resp.ok ? url : null;
    } catch {
      return null;
    }
  };

  const [legacy, enhanced] = await Promise.all([
    checkImage(legacyUrl),
    checkImage(enhancedUrl),
  ]);

  return { legacy, enhanced, rid };
}