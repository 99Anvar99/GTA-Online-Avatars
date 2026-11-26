import { isRockstarId, type Avatars } from "@/lib/avatars";

const AVATAR_CDN = "https://prod.cloud.rockstargames.com/members/sc";
const LOOKUP_TIMEOUT_MS = 5_000;
const EMPTY_SLOTS = { primary: null, secondary: null };

async function fetchProfile(player: string, byId: boolean, signal: AbortSignal) {
  const path = byId ? "r" : "n";
  const response = await fetch(
    `https://sc-cache.com/${path}/${encodeURIComponent(player)}`,
    { signal },
  );

  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 400 || response.status === 404) return null;
    throw new Error(`Profile lookup returned HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  const profile: unknown = Array.isArray(payload) ? payload[0] : payload;
  if (!profile || typeof profile !== "object") return null;

  const { id, name, username, nickname } = profile as Record<string, unknown>;
  const rid = typeof id === "string" || Number.isSafeInteger(id) ? String(id) : "";
  const handle = [name, username, nickname].find(
    (value): value is string => typeof value === "string" && value.trim() !== "",
  );

  return { rid: isRockstarId(rid) ? rid : null, username: handle ?? null };
}

async function checkImage(url: string, signal: AbortSignal) {
  const response = await fetch(url, { method: "HEAD", signal });
  if (response.ok) return url;
  if (response.status === 404 || response.status === 410) return null;
  throw new Error(`Avatar check returned HTTP ${response.status}`);
}

async function fetchImages(rid: string, signal: AbortSignal) {
  const [legacy0, legacy1, enhanced0, enhanced1] = await Promise.allSettled([
    checkImage(`${AVATAR_CDN}/6266/${rid}/publish/gta5/mpchars/0.png`, signal),
    checkImage(`${AVATAR_CDN}/6266/${rid}/publish/gta5/mpchars/1.png`, signal),
    checkImage(`${AVATAR_CDN}/0807/${rid}/publish/gta5/mpchars/0_pcrosalt.png`, signal),
    checkImage(`${AVATAR_CDN}/0807/${rid}/publish/gta5/mpchars/1_pcrosalt.png`, signal),
  ]);

  const getImage = (result: PromiseSettledResult<string | null>) =>
    result.status === "fulfilled" ? result.value : null;
  const legacy = {
    primary: getImage(legacy0) ?? getImage(legacy1),
    secondary: getImage(legacy1),
  };
  const enhanced = {
    primary: getImage(enhanced0) ?? getImage(enhanced1),
    secondary: getImage(enhanced1),
  };

  const failure = [legacy0, legacy1, enhanced0, enhanced1].find(
    (result) => result.status === "rejected",
  );
  if (!legacy.primary && !enhanced.primary && failure) throw failure.reason;

  return { legacy, enhanced };
}

export async function fetchAvatars(player: string): Promise<Avatars> {
  const signal = AbortSignal.timeout(LOOKUP_TIMEOUT_MS);

  if (isRockstarId(player)) {
    const [profile, images] = await Promise.all([
      fetchProfile(player, true, signal).catch(() => null),
      fetchImages(player, signal),
    ]);
    return { ...images, rid: player, username: profile?.username ?? null };
  }

  const { rid = null } = (await fetchProfile(player, false, signal)) ?? {};
  const images = rid
    ? await fetchImages(rid, signal)
    : { legacy: EMPTY_SLOTS, enhanced: EMPTY_SLOTS };

  return { ...images, rid, username: player };
}
