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
      <p className="text-lg font-medium">Follow-Up Suggestions</p>
      <ul className="text-left mt-2 space-y-1">
        {suggestions.slice(0, 5).map((suggestion, i) => {
          const sanitizedSuggestion = suggestion
            .replace(/^[-\s]+/, "")
            .replace(/"/g, "")
            .trim();
          return (
            <li key={i}>
              <button
                onClick={() => handleSearch(sanitizedSuggestion)}
                disabled={isLoading}
                className="text-neutral-400 hover:text-white transition-colors duration-300 group w-full text-left"
              >
                <span className="inline-block group-hover:scale-105 transition-transform duration-300 max-w-full">
                  <span
                    className="inline-block max-w-[calc(100%-1.25rem)] align-middle truncate"
                    title={sanitizedSuggestion}
                  >
                    {sanitizedSuggestion}
                  </span>
                  <PiMagnifyingGlassPlusBold className="inline w-4 h-4 ml-1 align-middle" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}