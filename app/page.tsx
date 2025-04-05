"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Header from "./components/ui/Header";
import Searches from "./components/search/Searches";
import { useSearchParams, useRouter } from "next/navigation";

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
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check-session");
        if (!response.ok) {
          setIsLoggedIn(false);
          setAuthError(`Failed to verify authentication status (Status: ${response.status})`);
          return;
        }
        const data = await response.json();
        setIsLoggedIn(data.isAuthenticated);
        setAuthError(null);
      } catch (error) {
        setIsLoggedIn(false);
        setAuthError("Authentication check failed");
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
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

  const handleNewSearch = useCallback(() => {
    setSelectedSession(null);
    setSessions((prev) => prev);
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col text-center bg-main px-2 lg:px-0">
      <Header sessions={sessions} setSessions={setSessions} onNewSearch={handleNewSearch} />
      {authError && <p className="text-danger">{authError}</p>}
      <Searches 
        sessionId={sessionId} 
        setSessions={setSessions}
        selectedSession={selectedSession}
        isLoggedIn={isLoggedIn}
        onNewSearch={handleNewSearch}
      />
      <footer className="w-full max-w-4xl mx-auto border-l border-r border-dashed border-primary/10 py-4 text-xs font-medium">
        SearchAI can make mistakes. Check your results.
      </footer>
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