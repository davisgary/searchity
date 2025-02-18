'use client';

import { useState } from 'react';
import { TfiWorld } from 'react-icons/tfi';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      console.log('Searching for:', searchQuery);

      const res = await fetch('/api/searchv2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: searchQuery }),
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (res.ok && data.message) {
        setResponse(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const convertTextToLinks = (text: string) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-center text-white">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-24">
        <h1 className="pb-6 font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
          Search the Web with AI
        </h1>
        <div className="w-full relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search..."
            className="w-full px-5 py-3 pr-16 bg-neutral-900 text-white placeholder-neutral-400 rounded-3xl shadow-[0_0_4px_rgba(255,255,255,0.6)] focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="absolute right-2 bg-black w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-80 transition-colors duration-200"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            aria-label="Search"
          >
            <TfiWorld className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {response && (
          <div className="mt-4 w-full text-left bg-neutral-900 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Summary:</h2>
            <p
              className="text-neutral-300 whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: convertTextToLinks(response.message || ''),
              }}
            />
          </div>
        )}

        {loading && <div className="px-5 mt-4 text-neutral-400 animate-pulse">Searching...</div>}
      </div>

      <footer className="py-4 text-xs">AI can make mistakes. Check your results.</footer>
    </div>
  );
}