"use client";

import { useState, useEffect, useCallback } from "react";
import Summary from "./Summary";
import Results from "./Results";
import Loading from "./Loading";
import SearchBar from "./SearchBar";
import Trends from "./Trends";
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
}

export default function Searches({ sessionId: initialSessionId, setSessions }: SearchesProps): ReactNode {
  const [displayedSearches, setDisplayedSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      if (!currentSessionId) {
        setDisplayedSearches([]);
        return;
      }

      try {
        console.time("Session Fetch");
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        const selectedSession = data.sessions.find((s: any) => s.id === parseInt(currentSessionId));
        console.log("Fetched session for sessionId", currentSessionId, ":", selectedSession);
        if (selectedSession) {
          setDisplayedSearches(selectedSession.searches);
          setSessions(data.sessions);
        }
        console.timeEnd("Session Fetch");
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load session");
      }
    }
    if (currentSessionId) fetchSession();
  }, [currentSessionId, setSessions]);

  const startNewSession = useCallback(() => {
    setCurrentSessionId(null);
    setDisplayedSearches([]);
    router.push("/");
  }, [router]);

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
        let isFinalProcessed = false;

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
              setDisplayedSearches((prev) => {
                const existing = prev.find((s) => s.query === trimmedQuery);
                if (existing) {
                  return prev.map((s) =>
                    s.query === trimmedQuery ? { ...s, summary } : s
                  );
                }
                return [...prev, { query: trimmedQuery, summary, results: [], suggestions: [] }];
              });
            }

            if (parsed.final && !isFinalProcessed) {
              finalResults = parsed.searchResults || [];
              finalSuggestions = parsed.suggestions || [];
              newSearch = { query: trimmedQuery, summary, results: finalResults, suggestions: finalSuggestions, timestamp: new Date().toISOString() };
              setDisplayedSearches((prev) => {
                const existing = prev.find((s) => s.query === trimmedQuery);
                if (existing) {
                  return prev.map((s) =>
                    s.query === trimmedQuery ? { ...s, results: finalResults, suggestions: finalSuggestions } : s
                  );
                }
                return [...prev, newSearch!];
              });
              isFinalProcessed = true;
              await addToSession(newSearch);
            }
          }
        }
        console.timeEnd("Stream Processing");

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
              console.log("New session created with ID:", addData.sessionId);
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
      } catch (error) {
        console.error("Search error:", error);
        setError("Search failed");
      } finally {
        setIsLoading(false);
      }
    },
    [displayedSearches, currentSessionId, router, setSessions]
  );

  useEffect(() => {
    if (displayedSearches.length) {
      const lastSearch = document.getElementById(`search-${displayedSearches.length - 1}`);
      lastSearch?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedSearches]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-16">
      <h1 className="pb-2 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
        Search the Web with AI
      </h1>
      <SearchBar handleSearch={handleSearch} isLoading={isLoading} />
      <div className="w-full overflow-hidden">
        <Trends handleSearch={handleSearch} />
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {displayedSearches.map((search, index) => (
        <div
          key={`${currentSessionId || "temp"}-${index}`}
          id={`search-${index}`}
          className="mt-4 w-full text-left"
        >
          <Summary summary={search.summary} />
          {search.results.length > 0 && <Results results={search.results} />}
          {(search.summary || search.results.length > 0) && (
            <p className="my-4">
              Search for "{search.query.replace(/^\d+\.\s*/, "").replace(/"/g, "")}"
            </p>
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
          {search.results.length > 0 && (
            <button
              onClick={startNewSession}
              className="mt-4 text-normal text-neutral-400 rounded-2xl border border-white/20 px-3 focus:outline-none focus:ring-0 active:bg-transparent transition-all duration-300 hover:scale-105"
            >
              New Search
            </button>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="mt-4 w-full text-left">
          <Loading isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}