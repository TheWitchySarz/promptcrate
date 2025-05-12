import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700">
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="PromptCrate Logo"
          width={180}
          height={180}
          priority
        />
        <h1 className="mt-8 text-5xl font-bold text-white drop-shadow-lg">PromptCrate</h1>
        <p className="mt-4 text-lg text-zinc-300">Centralized platform for AI prompt engineering</p>
      </div>
    </div>
  );
}
