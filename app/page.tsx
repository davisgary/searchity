"use client";

import { Suspense } from "react";
import Header from "./components/Header";
import Searches from "./components/Searches";
import { useSearchParams } from "next/navigation";

function IndexContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-center text-white">
      <Header />
      <Searches sessionId={sessionId} />
      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}

export default function IndexPage() {
  return (
    <Suspense fallback={null}>
      <IndexContent />
    </Suspense>
  );
}