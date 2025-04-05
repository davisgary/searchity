"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Summary from "./Summary";
import Results from "./Results";
import Loading from "./Loading";
import SearchBar from "./SearchBar";
import Trends from "./Trends";
import Suggestions from "./Suggestions";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

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

interface SearchesProps {
  sessionId: string | null;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  selectedSession: Session | null;
  isLoggedIn: boolean;
  onNewSearch?: () => void;
}

export default function Searches({ sessionId: initialSessionId, setSessions, selectedSession, isLoggedIn, onNewSearch }: SearchesProps): ReactNode {
  const [displayedSearches, setDisplayedSearches] = useState<Search[]>([]);
  const [currentSummary, setCurrentSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();
  const streamingRef = useRef<HTMLDivElement>(null);
  const latestSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearching || isLoading) return;

    if (isLoggedIn && initialSessionId && selectedSession && selectedSession.id.toString() === initialSessionId) {
      setDisplayedSearches(selectedSession.searches || []);
      setCurrentSessionId(initialSessionId);
    } else if (isLoggedIn && !initialSessionId) {
      setDisplayedSearches([]);
      setCurrentSessionId(null);
      setCurrentSummary("");
    }
  }, [selectedSession, initialSessionId, isSearching, isLoading, isLoggedIn]);

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      setIsSearching(true);
      setIsLoading(true);
      setError(null);
      setCurrentSummary("");

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmedQuery, sessionId: currentSessionId }),
        });
        if (!response.ok) throw new Error(`Search API failed: ${await response.text()}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Readable stream not supported");

        const decoder = new TextDecoder();
        let buffer = "";
        let summary = "";
        let finalResults: any[] = [];
        let finalSuggestions: string[] = [];
        let newSearch: Search | null = null;
        let newSessionId: number | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const parsed = JSON.parse(line);

            if (parsed.token !== undefined) {
              summary += parsed.token;
              setCurrentSummary(summary);
            }

            if (parsed.final) {
              finalResults = parsed.searchResults || [];
              finalSuggestions = parsed.suggestions || [];
              newSessionId = parsed.sessionId;
              newSearch = {
                query: trimmedQuery,
                summary,
                results: finalResults,
                suggestions: finalSuggestions,
                timestamp: new Date().toISOString(),
              };
              setDisplayedSearches((prev) => {
                if (isLoggedIn && newSessionId && currentSessionId !== newSessionId.toString()) {
                  return [newSearch!];
                }
                return [...prev, newSearch!];
              });
            }
          }
        }

        if (isLoggedIn && newSessionId) {
          setCurrentSessionId(newSessionId.toString());
          setSessions((prev) => {
            const existingSessionIndex = prev.findIndex((s) => s.id === newSessionId);
            if (existingSessionIndex >= 0) {
              const updatedSession = { ...prev[existingSessionIndex], searches: [...prev[existingSessionIndex].searches, newSearch!], updated_at: new Date().toISOString() };
              return [updatedSession, ...prev.filter((s) => s.id !== newSessionId)];
            } else {
              const newSession: Session = {
                id: newSessionId,
                user_id: "current_user_id",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                searches: [newSearch!],
              };
              return [newSession, ...prev];
            }
          });

          const sessionsResponse = await fetch("/api/sessions");
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            setSessions(sessionsData.sessions || []);
          }

          router.push(`/?sessionId=${newSessionId}`);
        }
      } catch (error) {
        setError("Search failed");
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [router, setSessions, isLoggedIn, currentSessionId]
  );

  useEffect(() => {
    if (isLoading && currentSummary && streamingRef.current) {
      const timeout = setTimeout(() => {
        if (streamingRef.current) {
          streamingRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentSummary, isLoading]);

  useEffect(() => {
    if (displayedSearches.length && !isLoading && latestSearchRef.current) {
      const timeout = setTimeout(() => {
        if (latestSearchRef.current) {
          latestSearchRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [displayedSearches, isLoading]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start flex-grow bg-main md:border-l md:border-r border-b border-dashed border-primary/10 py-10">
      <h1 className="pb-2 font-semibold tracking-tighter text-3xl sm:text-4xl md:text-5xl">
        Search the Web with AI
      </h1>
      <SearchBar handleSearch={handleSearch} isLoading={isLoading} />
      <div className="w-full overflow-hidden">
        <Trends handleSearch={handleSearch} />
      </div>
      {error && <p className="mt-4 text-danger">{error}</p>}
      {displayedSearches.map((search, index) => (
        <div
          key={`${currentSessionId || "temp"}-${index}`}
          id={`search-${index}`}
          className="mt-4 w-full text-left"
          ref={index === displayedSearches.length - 1 ? latestSearchRef : null}
        >
          <div className="px-2 sm:px-7">
            <Summary summary={search.summary} />
          </div>
          {search.results.length > 0 && <Results results={search.results} />}
          {(search.summary || search.results.length > 0) && (
            <div className="px-2 sm:px-7">
              <p className="my-4">
                Search for "{search.query.replace(/^\d+\.\s*/, "").replace(/"/g, "")}"
              </p>
              {search.suggestions.length > 0 && (
                <Suggestions
                  suggestions={search.suggestions}
                  handleSearch={handleSearch}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div ref={streamingRef} className="w-full text-left mt-4 px-2 sm:px-7">
          {currentSummary && <Summary summary={currentSummary} />}
          <Loading isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}