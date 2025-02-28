'use client';

import { useState, useEffect, useRef } from "react";
import { TfiWorld } from "react-icons/tfi";
import Header from "../components/Header";
import Summary from "../components/Summary";
import Results from "../components/Results";
import Trends from "../components/Trends";
import Loading from "../components/Loading";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function SearchesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSearchRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        console.log("Fetched sessions:", data.sessions);
        setSessions(data.sessions);

        const sessionId = searchParams.get("sessionId");
        if (sessionId) {
          const selectedSession = data.sessions.find(
            (s: Session) => s.id === parseInt(sessionId)
          );
          console.log("Selected session:", selectedSession);
          setCurrentSession(selectedSession || null);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [searchParams]);

  useEffect(() => {
    if (currentSession?.searches.length) {
      lastSearchRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "65px";
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!currentSession || !query.trim()) return;

    if (currentSession.searches.length >= 12) {
      setLimitMessage("This session is full (12 searches max). Start a new one or upgrade for more!");
      return;
    }

    setSearchLoading(true);
    setError(null);
    setLimitMessage(null);

    const newSearch: Search = {
      query: query.trim(),
      summary: "",
      results: [],
      suggestions: [],
    };

    setCurrentSession((prev) =>
      prev ? { ...prev, searches: [...prev.searches, newSearch] } : null
    );

    try {
      console.log("Starting search for query:", query);
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query.trim() }),
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
                        s.query === query.trim() ? { ...s, summary } : s
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
                        s.query === query.trim()
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

      console.log("Saving to session:", currentSession.id, { query, summary, finalResults, finalSuggestions });
      const addResponse = await fetch("/api/add-to-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          query: query.trim(),
          summary,
          results: finalResults,
          suggestions: finalSuggestions,
        }),
      });
      const addData = await addResponse.json();
      console.log("Database sync response:", addData);

      if (!addData.success) {
        if (addData.limitReached) {
          setLimitMessage(addData.message);
          setCurrentSession((prev) =>
            prev
              ? { ...prev, searches: prev.searches.filter((s) => s.query !== query.trim()) }
              : null
          );
        } else {
          throw new Error(`Add-to-session failed: ${addData.error || "Unknown error"}`);
        }
      }

      setInput("");
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Search failed");
      setCurrentSession((prev) =>
        prev
          ? { ...prev, searches: prev.searches.filter((s) => s.query !== query.trim()) }
          : null
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSessionChange = (sessionId: string) => {
    router.push(`/searches?sessionId=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-950 text-center text-white">
        <Header />
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-16">
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-center text-white">
      <Header />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-16">
        <h1 className="pb-2 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
          Past Search Sessions
        </h1>
        <div className="mt-4 w-full">
          <select
            value={currentSession?.id || ""}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="w-full bg-neutral-900 text-white rounded px-3 py-2 border border-white/20 focus:outline-none"
          >
            <option value="">Select a session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                Session {session.id} - Last Updated: {new Date(session.updated_at).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {currentSession ? (
          <>
            <div className="sticky top-0 z-10 bg-neutral-950 w-full pt-4">
              <div className="w-full relative flex items-center bg-neutral-900 rounded-2xl border border-white/20 px-5 pr-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch(input);
                    }
                  }}
                  placeholder="Add to this session..."
                  className="w-full bg-neutral-900 text-lg font-light text-white placeholder-neutral-400 focus:outline-none resize-none overflow-hidden py-4 pr-2"
                  rows={1}
                  style={{ minHeight: "65px", maxHeight: "200px", paddingTop: "19px", paddingBottom: "18px" }}
                />
                <button
                  onClick={() => handleSearch(input)}
                  disabled={searchLoading}
                  className="bg-neutral-950 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  aria-label="Search"
                >
                  <TfiWorld
                    className={`w-6 h-6 ${searchLoading ? "animate-spin" : ""} ${input ? "opacity-100" : "opacity-60"}`}
                  />
                </button>
              </div>
            </div>
            <div className="w-full overflow-hidden">
              <Trends handleSearch={handleSearch} />
            </div>
            {currentSession.searches.map((search, index) => {
              const isLastSearch = index === currentSession.searches.length - 1;
              return (
                <div
                  key={`${currentSession.id}-${index}`}
                  ref={isLastSearch ? lastSearchRef : undefined}
                  className="mt-4 w-full text-left"
                >
                  <Summary summary={search.summary} />
                  <Results results={search.results} />
                  {(search.summary || search.results.length > 0) && (
                    <p className="my-4">
                      Search for "{search.query.replace(/^\d+\.\s*/, "").replace(/"/g, "")}"
                    </p>
                  )}
                  {searchLoading && isLastSearch && !search.summary && !search.results.length && (
                    <Loading isLoading={searchLoading} />
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
                                disabled={searchLoading}
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
                  {isLastSearch && limitMessage && (
                    <p className="mt-4 text-yellow-500">{limitMessage}</p>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <p className="mt-4 text-neutral-400">Select a session to view its searches.</p>
        )}
      </div>
      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}