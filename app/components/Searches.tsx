"use client";

import { useState, useEffect, useCallback } from "react";
import Summary from "./Summary";
import Results from "./Results";
import Loading from "./Loading";
import SearchBar from "./SearchBar";
import Trends from "./Trends";
import { useRouter } from "next/navigation";

interface Search {
  query: string;
  summary: string;
  results: { title: string; link: string; snippet: string; image: string }[];
  suggestions: string[];
}

interface SearchesProps {
  sessionId: string | null;
}

export default function Searches({ sessionId }: SearchesProps) {
  const [displayedSearches, setDisplayedSearches] = useState<Search[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) {
        setDisplayedSearches([]);
        return;
      }

      try {
        console.time("Session Fetch");
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        const selectedSession = data.sessions.find(
          (s: any) => s.id === parseInt(sessionId)
        );
        console.log("Fetched session for sessionId", sessionId, ":", selectedSession);
        if (selectedSession) {
          setDisplayedSearches(selectedSession.searches);
        }
        console.timeEnd("Session Fetch");
      } catch (error) {
        console.error("Error fetching session:", error);
        setError("Failed to load session");
      }
    }
    if (sessionId) fetchSession();
  }, [sessionId]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || displayedSearches.length >= 15) {
      setError("This session is full (15 searches max). Start a new one or upgrade for more!");
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
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          chunkCount++;
          console.log(`Chunk ${chunkCount}:`, line);
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
            console.log("Processing final chunk:", parsed);
            finalResults = parsed.searchResults || [];
            finalSuggestions = parsed.suggestions || [];
            newSearch = { query: trimmedQuery, summary, results: finalResults, suggestions: finalSuggestions };
            console.log("Final search data received:", newSearch);
            setDisplayedSearches((prev) => {
              const existing = prev.find((s) => s.query === trimmedQuery);
              if (existing) {
                return prev.map((s) =>
                  s.query === trimmedQuery ? { ...s, results: finalResults, suggestions: finalSuggestions } : s
                );
              }
              console.log("Adding new search to state:", newSearch);
              return [...prev, newSearch!];
            });
            isFinalProcessed = true;
            addToSession(newSearch);
          } else if (parsed.final && isFinalProcessed) {
            console.log("Extra final chunk ignored:", parsed);
          }
        }
      }
      console.timeEnd("Stream Processing");

      async function addToSession(search: Search) {
        try {
          console.time("Add-to-Session API");
          const addResponse = await fetch("/api/add-to-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sessionId ? parseInt(sessionId) : null, ...search }),
          });
          const addData = await addResponse.json();
          console.timeEnd("Add-to-Session API");

          if (!addData.success) {
            if (addData.limitReached) setError(addData.message);
            else throw new Error(`Add-to-session failed: ${addData.error || "Unknown error"}`);
          } else if (addData.isNewSession || !sessionId) {
            console.log("New session created, redirecting to:", addData.sessionId);
            router.push(`/?sessionId=${addData.sessionId}`);
          } else {
            setDisplayedSearches((prev) => {
              const serverSearches = addData.updatedSearches as Search[];
              const alreadyAdded = prev.some((s) => s.query === search.query && s.summary === search.summary);
              if (alreadyAdded && prev.length === serverSearches.length) {
                console.log("Server sync skipped - search already added:", serverSearches);
                return prev;
              }
              console.log("Syncing with server data:", serverSearches);
              return serverSearches;
            });
          }
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error("Add-to-session error:", err);
          setError(err.message);
          setDisplayedSearches((prev) => prev.filter((s) => s.query !== search.query));
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Search error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [displayedSearches, sessionId, router]);

  useEffect(() => {
    if (displayedSearches.length) {
      const lastSearch = document.getElementById(`search-${displayedSearches.length - 1}`);
      lastSearch?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedSearches]);

  console.log("Rendering Searches - sessionId:", sessionId, "isLoading:", isLoading, "displayedSearches length:", displayedSearches.length);

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
          key={`${sessionId || "temp"}-${index}`}
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