"use client";

import { PiArrowUpRightBold } from "react-icons/pi";

interface SuggestionsProps {
  suggestions: string[];
  handleSearch: (query: string) => Promise<void>;
  isLoading: boolean;
}

export default function Suggestions({ suggestions, handleSearch, isLoading }: SuggestionsProps) {
  return (
    <div>
      <h4 className="text-lg font-medium">Follow-Up Suggestions</h4>
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
                className="flex items-center text-left w-full text-neutral-400 hover:underline"
              >
                {sanitizedSuggestion}
                <PiArrowUpRightBold className="ml-1" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}