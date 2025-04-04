"use client";

import { Suspense, useState, useEffect } from "react";
import Header from "./components/ui/Header";
import Searches from "./components/search/Searches";
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("Fetching from /api/auth/check-session...");
        const response = await fetch("/api/auth/check-session");
        if (!response.ok) {
          console.error(`Check session failed with status: ${response.status} ${response.statusText}`);
          setIsLoggedIn(false);
          setAuthError(`Failed to verify authentication status (Status: ${response.status})`);
          return;
        }
        const data = await response.json();
        console.log("Auth response:", data);
        setIsLoggedIn(data.isAuthenticated);
        setUserImage(data.userImage);
        setAuthError(null);
      } catch (error) {
        console.error("Error checking auth:", error);
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
        console.log("Initial sessions fetch:", data.sessions);
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
      console.log("Updated selectedSession:", session);
    } else {
      setSelectedSession(null);
      console.log("No sessionId, cleared selectedSession");
    }
  }, [sessionId, sessions]);

  const handleNewSearch = () => {
    setSelectedSession(null);
    console.log("New search triggered from IndexContent");
  };

  return (
    <div className="min-h-screen flex flex-col text-center bg-main">
      <Header sessions={sessions} setSessions={setSessions} />
      {authError && <p className="text-red-500">{authError}</p>}
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