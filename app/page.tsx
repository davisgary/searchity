"use client";

import { Suspense, useState, useEffect } from "react";
import Header from "./components/Header";
import Searches from "./components/Searches";
import { useSearchParams } from "next/navigation";

interface Search {
  query: string;
  summary: string;
  results: { title: string; link: string; snippet: string; image: string }[];
  suggestions: string[];
  timestamp?: string;
}

interface Session {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  searches: Search[];
}

function IndexContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      }
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      const session = sessions.find((s) => s.id === Number(sessionId));
      setSelectedSession(session || null);
    } else {
      setSelectedSession(null);
    }
  }, [sessionId, sessions]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-center text-white">
      <Header sessions={sessions} setSessions={setSessions} />
      <Searches 
        sessionId={sessionId} 
        setSessions={setSessions} 
        selectedSession={selectedSession}
      />
      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}

export default function IndexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndexContent />
    </Suspense>
  );
}