"use client";

import { PiMagnifyingGlassPlusBold } from "react-icons/pi";

interface SuggestionsProps {
  suggestions: string[];
  handleSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export default function Suggestions({ suggestions, handleSearch, isLoading }: SuggestionsProps) {
  return (
    <div>
      <div className="flex items-center">
        <p className="text-primary/90 tracking-wide">Follow-Up Suggestions</p>
        <PiMagnifyingGlassPlusBold className="text-primary/80 inline w-4 h-4 ml-1 align-middle" />
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.slice(0, 6).map((suggestion, i) => {
          const sanitizedSuggestion = suggestion
            .replace(/^[-\s]+/, "")
            .replace(/"/g, "")
            .trim();
          return (
            <button
              key={i}
              onClick={() => handleSearch(sanitizedSuggestion)}
              disabled={isLoading}
              className="w-full flex items-center justify-between rounded-md py-2 px-3 text-sm text-primary/90 text-left border border-primary/30 hover:scale-105 hover:border-primary/50 transition-all duration-300"
            >
              <span
                className="inline-block align-middle"
                title={sanitizedSuggestion}
              >
                {sanitizedSuggestion}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}