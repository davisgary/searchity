"use client";

import { useState, useEffect } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";

interface SearchBarProps {
  handleSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ handleSearch, isLoading = false }: SearchBarProps) {
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  const placeholders = [
    "What's happening around the world today?",
    "Top travel destinations in 2025",
    "Latest advancements in AI",
    "What are the health benefits of coffee?",
    "Best smartphones to buy in 2025",
    "New shows to binge watch",
    "What are the best ways to save money?",
    "Why do cats purr?",
    "How to make the perfect homemade pizza",
    "What's the fastest car in the world?",
    "How can I improve my sleep quality?",
    "What are the best self-help books to read",
    "Must-listen podcasts of 2025",
    "Upcoming space missions",
    "How does machine learning work?",
    "What are the benefits of meditation?",
    "The most popular video games of 2025",
    "How to make the perfect cup of tea",
    "What are the best ways to reduce stress?",
    "How to create a successful YouTube channel",
    "How to improve your mental health",
    "The best ways to learn a new language",
    "The best movies of all time",
    "How to improve your focus?",
  ];

  useEffect(() => {
    if (!input) {
      let currentText = "";
      const currentPlaceholder = placeholders[placeholderIndex];
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        if (charIndex < currentPlaceholder.length) {
          currentText += currentPlaceholder[charIndex];
          setDisplayedText(currentText);
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setDisplayedText("");
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          }, 3000);
        }
      }, 50);

      return () => clearInterval(typeInterval);
    } else {
      setDisplayedText("");
    }
  }, [input, placeholderIndex, placeholders.length]);

  const isInputValid = input.trim().length > 0;

  const onSearch = () => {
    if (isInputValid) {
      handleSearch(input);
      setInput("");
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-neutral-900 w-full pt-4">
      <div className="w-full relative flex items-center bg-neutral-800 rounded-2xl border-2 border-white/20 px-3 h-16">
        <div className="relative w-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isInputValid) {
                e.preventDefault();
                onSearch();
              }
            }}
            aria-label="Enter your search"
            placeholder=""
            className="w-full bg-neutral-800 text-lg leading-normal text-white focus:outline-none focus:ring-0 h-full pl-3 pr-5"
          />
          {!input && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-normal text-white/60 pointer-events-none">
              {displayedText}
            </span>
          )}
        </div>
        <button
          onClick={onSearch}
          disabled={isLoading || !isInputValid}
          className="bg-neutral-900 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          aria-label="Search"
        >
          <PiMagnifyingGlassBold
            className={`w-6 h-6 ${isLoading ? "animate-pulse" : ""} ${isInputValid ? "opacity-100" : "opacity-80"}`}
          />
        </button>
      </div>
    </div>
  );
}