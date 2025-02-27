'use client';

import { useState, useRef, useEffect } from 'react';
import { TfiWorld } from 'react-icons/tfi';
import Header from './components/Header';
import Summary from './components/Summary';
import Results from './components/Results';
import Trends from './components/Trends';
import Loading from './components/Loading';

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

export default function IndexPage() {
  const [searchSessions, setSearchSessions] = useState<SearchSession[]>([]);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastSearchRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<number>(0);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (searchSessions.length > 0) {
      lastSearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchSessions]);

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setGlobalLoading(true);
    setError(null);

    const newId = sessionIdRef.current;
    sessionIdRef.current++;

    setSearchSessions((prev) => [
      ...prev,
      {
        id: newId,
        query: trimmedQuery,
        summary: '',
        results: [],
        suggestions: [],
        loading: true,
      },
    ]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedQuery }),
      });
      if (!response.ok) throw new Error('Failed to fetch search results');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Readable stream not supported in this browser.');

      const decoder = new TextDecoder();
      let buffer = '';
      let summary = '';
      let finalResults: SearchResult[] = [];
      let finalSuggestions: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

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
            console.error('Error parsing JSON line:', err, line);
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
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setSearchSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === newId ? { ...session, loading: false } : session
        )
      );
    } finally {
      setGlobalLoading(false);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '65px';
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-center text-white">
      <Header />
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-16">
        <h1 className="pb-2 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
          Search the Web with AI
        </h1>
        <div className="sticky top-0 z-10 bg-neutral-950 w-full pt-4">
          <div className="w-full relative flex items-center bg-neutral-900 rounded-2xl border border-white/20 px-5 pr-3">
          <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(input);
                }
              }}
              placeholder="Enter your search..."
              className="w-full bg-neutral-900 text-lg font-light text-white placeholder-neutral-400 focus:outline-none resize-none overflow-hidden py-4 pr-2"
              rows={1}
              style={{ minHeight: '65px', maxHeight: '200px', paddingTop: '19px', paddingBottom: '18px', }}
            />
            <button
              onClick={() => handleSearch(input)}
              disabled={globalLoading}
              className="bg-neutral-950 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              aria-label="Search"
            >
              <TfiWorld className={`w-6 h-6 ${globalLoading ? 'animate-spin' : ''} ${input ? 'opacity-100' : 'opacity-60'}`}  />
            </button>
          </div>
        </div>
        <div className="w-full overflow-hidden">

        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {searchSessions.map((session, index) => {
          const isLastSession = index === searchSessions.length - 1;
          return (
            <div
              key={session.id}
              ref={isLastSession ? lastSearchRef : undefined}
              className="mt-4 w-full text-left"
            >
              <Summary summary={session.summary} />
              <Results results={session.results} />
              {(session.summary || session.results.length > 0) && (
                <p className="my-4">
                  Search for "{session.query.replace(/^\d+\.\s*/, '').replace(/"/g, '')}"
                </p>
              )}
              {session.loading && <Loading isLoading={session.loading} />}
              {session.suggestions.length > 0 && (
              <div>
                <h4 className="text-lg font-medium">Follow-Up Suggestions</h4>
                <ul className="text-left mt-2 space-y-1">
                  {session.suggestions.slice(0, 5).map((suggestion, i) => {
                    const sanitizedSuggestion = suggestion.replace(/^[-\s]+/, '').replace(/"/g, '').trim();
                    return (
                      <li key={i}>
                        <button
                          onClick={() => {
                            console.log('Suggestion clicked:', sanitizedSuggestion);
                            handleSearch(sanitizedSuggestion);
                          }}
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
          );
        })}
      </div>
      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}