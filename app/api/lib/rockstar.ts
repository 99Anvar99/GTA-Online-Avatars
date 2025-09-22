import fetch from "node-fetch";

export interface Avatars {
  legacy: string | null;
  enhanced: string | null;
  rid: string | null;
  username: string | null;
}

export async function fetchAvatars(player: string): Promise<Avatars> {
  let rid: string | null = null;
  let username: string | null = null;

  if (/^\d+$/.test(player)) {
    rid = player;

    try {
      const resp = await fetch(`https://sc-cache.com/r/${rid}`);
      if (resp.ok) {
        const data = await resp.json();
        username =
          Array.isArray(data) && data.length > 0
            ? data[0]?.name || data[0]?.username || data[0]?.nickname || null
            : data?.name || data?.username || data?.nickname || null;
      }
    } catch (err) {
      console.error("Failed to fetch Username from RID:", err);
    }
  } else {
    username = player;

    try {
      const resp = await fetch(`https://sc-cache.com/n/${username}`);
      if (resp.ok) {
        const data = await resp.json();
        rid =
          Array.isArray(data) && data.length > 0
            ? data[0]?.id?.toString() || null
            : data?.id?.toString() || null;
      }
    } catch (err) {
      console.error("Failed to fetch RID from Username:", err);
    }
  }

  if (!rid) {
    return { legacy: null, enhanced: null, rid: null, username };
  }

  const legacyUrl = `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/0.png`;
  const enhancedUrl = `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/0_pcrosalt.png`;

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

  return { legacy, enhanced, rid, username };
}
