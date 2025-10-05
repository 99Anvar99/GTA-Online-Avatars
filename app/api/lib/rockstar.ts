import fetch from "node-fetch";

export interface Avatars {
  legacy: { primary: string | null; secondary: string | null };
  enhanced: { primary: string | null; secondary: string | null };
  rid: string | null;
  username: string | null;
}

interface SCUser {
  id?: number | string;
  name?: string;
  username?: string;
  nickname?: string;
}

export async function fetchAvatars(player: string): Promise<Avatars> {
  let rid: string | null = null;
  let username: string | null = null;

  if (/^\d+$/.test(player)) {
    rid = player;
    const resp = await fetch(`https://sc-cache.com/r/${rid}`);
    if (resp.ok) {
      const raw = (await resp.json()) as SCUser | SCUser[];
      const data = Array.isArray(raw) ? raw[0] : raw;
      username = data?.name || data?.username || data?.nickname || null;
    }
  } else {
    username = player;
    const resp = await fetch(`https://sc-cache.com/n/${username}`);
    if (resp.ok) {
      const raw = (await resp.json()) as SCUser | SCUser[];
      const data = Array.isArray(raw) ? raw[0] : raw;
      rid = data?.id?.toString() || null;
      if (!username)
        username = data?.name || data?.username || data?.nickname || null;
    }
  }

  if (!rid) {
    return {
      legacy: { primary: null, secondary: null },
      enhanced: { primary: null, secondary: null },
      rid: null,
      username,
    };
  }

  const urls = {
    legacy: [
      `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/0.png`,
      `https://prod.cloud.rockstargames.com/members/sc/6266/${rid}/publish/gta5/mpchars/1.png`,
    ],
    enhanced: [
      `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/0_pcrosalt.png`,
      `https://prod.cloud.rockstargames.com/members/sc/0807/${rid}/publish/gta5/mpchars/1_pcrosalt.png`,
    ],
  };

  const checkImage = async (url: string) => {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok ? url : null;
    } catch {
      return null;
    }
  };

  const [legacy0, legacy1, enhanced0, enhanced1] = await Promise.all([
    checkImage(urls.legacy[0]),
    checkImage(urls.legacy[1]),
    checkImage(urls.enhanced[0]),
    checkImage(urls.enhanced[1]),
  ]);

  return {
    legacy: { primary: legacy0 || legacy1, secondary: legacy1 || null },
    enhanced: { primary: enhanced0 || enhanced1, secondary: enhanced1 || null },
    rid,
    username,
  };
}