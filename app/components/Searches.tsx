"use client";

import { useState, useEffect } from "react";
import Summary from "./Summary";
import Results from "./Results";
import Loading from "./Loading";

interface Search {
  query: string;
  summary: string;
  results: { title: string; link: string; snippet: string; image: string }[];
  suggestions: string[];
}

interface Session {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  searches: Search[];
}

interface SearchesProps {
  sessionId: string | null;
  isLoading: boolean;
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  handleSearch: (query: string) => void;
}

export default function Searches({
  sessionId,
  isLoading,
  currentSession,
  setCurrentSession,
  handleSearch,
}: SearchesProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setCurrentSession(null);
        return;
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        console.log("Fetched sessions:", data.sessions);

        const selectedSession = data.sessions.find(
          (s: Session) => s.id === parseInt(sessionId)
        );
        console.log("Selected session:", selectedSession);
        setCurrentSession(selectedSession || null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load session");
      }
    }
    fetchSession();
  }, [sessionId, setCurrentSession]);

  useEffect(() => {
    if (currentSession?.searches.length) {
      const lastSearch = document.getElementById(`search-${currentSession.searches.length - 1}`);
      lastSearch?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession]);

  if (!currentSession) {
    return <p className="mt-4 text-neutral-400">Select a previous search</p>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {currentSession.searches.map((search, index) => (
        <div
          key={`${currentSession.id}-${index}`}
          id={`search-${index}`}
          className="mt-4 w-full text-left"
        >
          <Summary summary={search.summary} />
          <Results results={search.results} />
          {(search.summary || search.results.length > 0) && (
            <p className="my-4">
              Search for "{search.query.replace(/^\d+\.\s*/, "").replace(/"/g, "")}"
            </p>
          )}
          {isLoading && index === currentSession.searches.length - 1 && !search.summary && !search.results.length && (
            <Loading isLoading={isLoading} />
          )}
          {search.suggestions.length > 0 && (
            <div>
              <h4 className="text-lg font-medium">Follow-Up Suggestions</h4>
              <ul className="text-left mt-2 space-y-1">
                {search.suggestions.slice(0, 5).map((suggestion, i) => {
                  const sanitizedSuggestion = suggestion
                    .replace(/^[-\s]+/, "")
                    .replace(/"/g, "")
                    .trim();
                  return (
                    <li key={i}>
                      <button
                        onClick={() => handleSearch(sanitizedSuggestion)}
                        disabled={isLoading}
                        className="text-left w-full text-neutral-400 hover:underline"
                      >
                        {sanitizedSuggestion}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}