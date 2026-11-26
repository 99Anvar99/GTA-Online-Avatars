import { fetchAvatars } from "@/app/api/lib/rockstar";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const player = new URL(req.url).searchParams.get("player")?.trim();

  if (!player) {
    return NextResponse.json({ error: "No player specified" }, { status: 400 });
  }
  if (player === "." || player === "..") {
    return NextResponse.json({ error: "Invalid player" }, { status: 400 });
  }

  try {
    const avatars = await fetchAvatars(player);
    return NextResponse.json(avatars, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (err) {
    console.error("Avatar lookup failed", err);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 502 },
    );
  }
}
