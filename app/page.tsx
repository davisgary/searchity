'use client';

import Link from 'next/link';

export default function IndexPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black text-center text-white">
      <div className="font-semibold relative z-20 w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-24">
        <Link href="/searchv2" className="text-lg m-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-white to-white hover:text-teal-500 transition duration-300">
          Search <span className="text-sm">/ sonar-pro (DeepSeek R1)</span>
        </Link>
        <Link href="/search" className="text-lg m-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-white to-white hover:text-teal-500 transition duration-300">
          Search <span className="text-sm">/ gpt-4o-mini, Google Search, Bing v7</span>
        </Link>
        <Link href="/chat" className="text-lg m-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-white to-white hover:text-teal-500 transition duration-300">
          Chat <span className="text-sm">/ gpt-4o-mini with custom context</span>
        </Link>
        <Link href="/image" className="text-lg m-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 via-white to-white hover:text-violet-500 transition duration-300">
          Image <span className="text-sm">/ Stable Diffusion 3</span>
        </Link>
      </div>
      <footer className="py-4 text-xs">
        Exploring the world of AI.
      </footer>
    </div>
  );
}