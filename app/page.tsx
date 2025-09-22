"use client";
import React, { useState } from "react";
import { Image } from "@heroui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Avatars } from "./api/lib/rockstar";

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

  const handleSearch = async () => {
    if (!input) return;
    setStatus("🔎 Searching...");
    setSearched(true);

    try {
      const res = await fetch(`/api/rockstar?player=${input}`);
      const data: Avatars = await res.json();
      setAvatars(data);

      if (!data.legacy && !data.enhanced) setStatus("❌ No avatars found");
      else setStatus("✅ Avatars loaded");
    } catch {
      setStatus("❌ Failed to fetch");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          GTA 5 Online Player Avatar Lookup
        </h1>
        <p className="text-gray-300 mt-2 font-bold">Legacy & Enhanced Edition</p>
      </div>

      {/* Input */}
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="text"
          placeholder="Enter Username or RID"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="button" onClick={handleSearch} variant="outline">
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
