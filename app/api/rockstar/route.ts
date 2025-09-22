import { fetchAvatars } from "@/app/api/lib/rockstar";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const player = url.searchParams.get("player");
  if (!player)
    return NextResponse.json({ error: "No player specified" }, { status: 400 });

  try {
    const avatars = await fetchAvatars(player);
    return NextResponse.json(avatars);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch avatars: {}", err },
      { status: 500 }
    );
  }
}