"use client";

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
                className="text-left w-full text-neutral-400 hover:underline"
              >
                {sanitizedSuggestion}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}