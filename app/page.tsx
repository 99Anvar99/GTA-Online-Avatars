import { AvatarSearch } from "@/components/avatar-search";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <main className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-center px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            GTA 5 Online Player Avatar Lookup
          </h1>
          <p className="mt-2 font-bold text-gray-300">Legacy & Enhanced Edition</p>
        </header>
        <AvatarSearch />
      </main>

      <footer className="px-6 pb-4 text-center text-xs text-gray-400">
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
    </div>
  );
}
