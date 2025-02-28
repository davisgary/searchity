"use client";

import { useState, useRef, Suspense } from "react";
import Header from "./components/Header";
import Summary from "./components/Summary";
import Results from "./components/Results";
import Trends from "./components/Trends";
import Loading from "./components/Loading";
import Searches from "./components/Searches";
import SearchBar from "./components/SearchBar";
import { useSearchParams } from "next/navigation";

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  image: string;
};

type SearchSession = {
  id: number;
  query: string;
  summary: string;
  results: SearchResult[];
  suggestions: string[];
  loading: boolean;
};

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

function IndexContent() {
  const [searchSessions, setSearchSessions] = useState<SearchSession[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setGlobalLoading(true);
    setError(null);

    if (sessionId && currentSession) {
      if (currentSession.searches.length >= 15) {
        setError("This session is full (15 searches max). Start a new one or upgrade for more!");
        setGlobalLoading(false);
        return;
      }

      const newSearch: Search = {
        query: trimmedQuery,
        summary: "",
        results: [],
        suggestions: [],
      };

      setCurrentSession((prev) =>
        prev ? { ...prev, searches: [...prev.searches, newSearch] } : null
      );

      try {
        console.log("Starting search for query:", trimmedQuery);
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmedQuery }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Search API failed: ${errorText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Readable stream not supported");

        const decoder = new TextDecoder();
        let buffer = "";
        let summary = "";
        let finalResults: any[] = [];
        let finalSuggestions: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.token) {
                summary += parsed.token;
                setCurrentSession((prev) =>
                  prev
                    ? {
                        ...prev,
                        searches: prev.searches.map((s) =>
                          s.query === trimmedQuery ? { ...s, summary } : s
                        ),
                      }
                    : null
                );
              }
              if (parsed.final) {
                finalResults = parsed.searchResults || [];
                finalSuggestions = parsed.suggestions || [];
                console.log("Search completed:", { finalResults, finalSuggestions });
                setCurrentSession((prev) =>
                  prev
                    ? {
                        ...prev,
                        searches: prev.searches.map((s) =>
                          s.query === trimmedQuery
                            ? { ...s, summary, results: finalResults, suggestions: finalSuggestions }
                            : s
                        ),
                      }
                    : null
                );
              }
            } catch (err) {
              console.error("Error parsing JSON line:", err, "Line:", line);
            }
          }
        }

        console.log("Saving to session:", currentSession.id, { query: trimmedQuery, summary, finalResults, finalSuggestions });
        const addResponse = await fetch("/api/add-to-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSession.id,
            query: trimmedQuery,
            summary,
            results: finalResults,
            suggestions: finalSuggestions,
          }),
        });
        const addData = await addResponse.json();
        console.log("Database sync response:", addData);

        if (!addData.success) {
          if (addData.limitReached) {
            setError(addData.message);
            setCurrentSession((prev) =>
              prev
                ? { ...prev, searches: prev.searches.filter((s) => s.query !== trimmedQuery) }
                : null
            );
          } else {
            throw new Error(`Add-to-session failed: ${addData.error || "Unknown error"}`);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
        setError(error instanceof Error ? error.message : "Search failed");
        setCurrentSession((prev) =>
          prev
            ? { ...prev, searches: prev.searches.filter((s) => s.query !== trimmedQuery) }
            : null
        );
      } finally {
        setGlobalLoading(false);
      }
    } else {
      const newId = sessionIdRef.current;
      sessionIdRef.current++;

      setSearchSessions((prev) => [
        ...prev,
        {
          id: newId,
          query: trimmedQuery,
          summary: "",
          results: [],
          suggestions: [],
          loading: true,
        },
      ]);

      try {
        console.log("Starting live search for query:", trimmedQuery);
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmedQuery }),
        });
        if (!response.ok) throw new Error("Failed to fetch search results");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Readable stream not supported in this browser.");

        const decoder = new TextDecoder();
        let buffer = "";
        let summary = "";
        let finalResults: SearchResult[] = [];
        let finalSuggestions: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.token) {
                summary += parsed.token;
                setSearchSessions((prevSessions) =>
                  prevSessions.map((session) =>
                    session.id === newId ? { ...session, summary } : session
                  )
                );
              }
              if (parsed.final) {
                finalResults = parsed.searchResults || [];
                finalSuggestions = parsed.suggestions || [];
              }
            } catch (err) {
              console.error("Error parsing JSON line:", err, line);
            }
          }
        }

        setSearchSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === newId
              ? {
                  ...session,
                  summary,
                  results: finalResults,
                  suggestions: finalSuggestions,
                  loading: false,
                }
              : session
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setSearchSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === newId ? { ...session, loading: false } : session
          )
        );
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-center text-white">
      <Header />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-16">
        <h1 className="pb-2 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
          Search the Web with AI
        </h1>
        <SearchBar handleSearch={handleSearch} isLoading={globalLoading} />
        <div className="w-full overflow-hidden">
          <Trends handleSearch={handleSearch} />
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {!sessionId ? (
          searchSessions.map((session, index) => (
            <div
              key={session.id}
              id={`live-search-${index}`}
              className="mt-4 w-full text-left"
            >
              <Summary summary={session.summary} />
              <Results results={session.results} />
              {(session.summary || session.results.length > 0) && (
                <p className="my-4">
                  Search for "{session.query.replace(/^\d+\.\s*/, "").replace(/"/g, "")}"
                </p>
              )}
              {session.loading && <Loading isLoading={session.loading} />}
              {session.suggestions.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium">Follow-Up Suggestions</h4>
                  <ul className="text-left mt-2 space-y-1">
                    {session.suggestions.slice(0, 5).map((suggestion, i) => {
                      const sanitizedSuggestion = suggestion
                        .replace(/^[-\s]+/, "")
                        .replace(/"/g, "")
                        .trim();
                      return (
                        <li key={i}>
                          <button
                            onClick={() => handleSearch(sanitizedSuggestion)}
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
          ))
        ) : (
          <Searches
            sessionId={sessionId}
            isLoading={globalLoading}
            currentSession={currentSession}
            setCurrentSession={setCurrentSession}
            handleSearch={handleSearch}
          />
        )}
      </div>
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