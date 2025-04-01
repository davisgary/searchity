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
}

export default function Searches({ sessionId: initialSessionId, setSessions, selectedSession }: SearchesProps): ReactNode {
  const [displayedSearches, setDisplayedSearches] = useState<Search[]>([]);
  const [currentSummary, setCurrentSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);
  const router = useRouter();
  const streamingRef = useRef<HTMLDivElement>(null);
  const latestSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSession) {
      setDisplayedSearches(selectedSession.searches || []);
      setCurrentSessionId(selectedSession.id.toString());
    } else if (!initialSessionId) {
      setDisplayedSearches([]);
      setCurrentSessionId(null);
    }
  }, [selectedSession, initialSessionId]);

  useEffect(() => {
    async function fetchSession() {
      if (!initialSessionId || selectedSession) return;
      try {
        console.time("Session Fetch");
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        const session = data.sessions.find((s: any) => s.id === parseInt(initialSessionId));
        if (session) {
          setDisplayedSearches(session.searches);
          setSessions(data.sessions);
          setCurrentSessionId(initialSessionId);
        }
        console.timeEnd("Session Fetch");
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load session");
      }
    }
    if (initialSessionId && !selectedSession) fetchSession();
  }, [initialSessionId, setSessions, selectedSession]);

  const handleSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      if (currentSessionId && displayedSearches.length >= 10) {
        setError("This session is full (10 searches max). Start a new one!");
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentSummary("");

      try {
        console.time("Search API");
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmedQuery }),
        });
        if (!response.ok) throw new Error(`Search API failed: ${await response.text()}`);
        console.timeEnd("Search API");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Readable stream not supported");

        const decoder = new TextDecoder();
        let buffer = "";
        let summary = "";
        let finalResults: any[] = [];
        let finalSuggestions: string[] = [];
        let newSearch: Search | null = null;

        console.time("Stream Processing");
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
              newSearch = {
                query: trimmedQuery,
                summary,
                results: finalResults,
                suggestions: finalSuggestions,
                timestamp: new Date().toISOString(),
              };
              setDisplayedSearches((prev) => [...prev, newSearch!]);
              await addToSession(newSearch);
            }
          }
        }
        console.timeEnd("Stream Processing");
      } catch (error) {
        console.error("Search error:", error);
        setError("Search failed");
      } finally {
        setIsLoading(false);
      }

      async function addToSession(search: Search) {
        try {
          console.time("Add-to-Session API");
          const addResponse = await fetch("/api/sessions/add-to", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: currentSessionId ? parseInt(currentSessionId) : null, ...search }),
          });
          const addData = await addResponse.json();
          console.timeEnd("Add-to-Session API");

          if (!addData.success) {
            if (addData.limitReached) setError(addData.message);
            else throw new Error(`Add-to-session failed: ${addData.error || "Unknown error"}`);
            return;
          }

          if (addData.isNewSession || !currentSessionId) {
            setCurrentSessionId(addData.sessionId);
            router.push(`/?sessionId=${addData.sessionId}`);
            setSessions((prev) => {
              const newSession: Session = {
                id: addData.sessionId,
                user_id: "current_user_id",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                searches: addData.updatedSearches,
              };
              return [newSession, ...prev.filter((s) => s.id !== newSession.id)];
            });
          } else {
            setDisplayedSearches(addData.updatedSearches);
            setSessions((prev) => {
              const updatedSession: Session = {
                id: parseInt(currentSessionId!),
                user_id: "current_user_id",
                created_at: prev.find((s) => s.id === parseInt(currentSessionId!))?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                searches: addData.updatedSearches,
              };
              return prev.map((s) => (s.id === updatedSession.id ? updatedSession : s));
            });
          }
        } catch (error) {
          console.error("Add-to-session error:", error);
          setError("Failed to add search to session");
          setDisplayedSearches((prev) => prev.filter((s) => s.query !== search.query));
        }
      }
    },
    [displayedSearches, currentSessionId, router, setSessions]
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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow bg-secondary border border-primary/20 rounded-lg py-10">
      <h1 className="pb-2 font-semibold tracking-tight text-3xl sm:text-4xl md:text-5xl">
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
          <div className="px-2">
            <Summary summary={search.summary} />
          </div>
          {search.results.length > 0 && <Results results={search.results} />}
          {(search.summary || search.results.length > 0) && (
          <div className="px-2">
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
        <div ref={streamingRef} className="mt-4 w-full text-left">
          {currentSummary && <Summary summary={currentSummary} />}
          <Loading isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}