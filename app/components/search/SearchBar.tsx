"use client";

import { useState, useEffect, useRef } from "react";
import { PiMagnifyingGlassBold } from "react-icons/pi";

interface SearchBarProps {
  handleSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ handleSearch, isLoading = false }: SearchBarProps) {
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderActive, setIsPlaceholderActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
    if (isPlaceholderActive) {
      let currentText = "";
      const currentPlaceholder = placeholders[placeholderIndex];
      let charIndex = 0;

      const typeInterval = setInterval(() => {
        if (charIndex < currentPlaceholder.length) {
          currentText = currentPlaceholder.slice(0, charIndex + 1);
          setInput(currentText);
          if (inputRef.current) {
            const scrollToEnd = () => {
              if (inputRef.current) {
                const maxScroll = inputRef.current.scrollWidth + 20;
                inputRef.current.scrollLeft = maxScroll;
                requestAnimationFrame(() => {
                  if (inputRef.current) inputRef.current.scrollLeft = maxScroll;
                  setTimeout(() => {
                    if (inputRef.current) inputRef.current.scrollLeft = maxScroll;
                  }, 10);
                });
              }
            };
            scrollToEnd();
          }
          charIndex++;
        } else {
          clearInterval(typeInterval);
          animationRef.current = setTimeout(() => {
            if (inputRef.current) inputRef.current.scrollLeft = 0;
            setInput("");
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          }, 3000);
        }
      }, 50);

      return () => {
        clearInterval(typeInterval);
        if (animationRef.current) clearTimeout(animationRef.current);
        if (inputRef.current) inputRef.current.scrollLeft = 0;
      };
    }
  }, [isPlaceholderActive, placeholderIndex, placeholders.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsPlaceholderActive(false);
  };

  const handleFocus = () => {
    if (isPlaceholderActive) {
      setInput("");
      setIsPlaceholderActive(false);
    }
  };

  const isInputValid = input.trim().length > 0 && !isPlaceholderActive;

  const onSearch = () => {
    if (isInputValid) {
      handleSearch(input);
      setInput("");
      setIsPlaceholderActive(true);
    }
  };

  return (
    <div className="sticky top-0 z-10 w-full max-w-3xl pt-4 px-3 sm:px-5">
      <div className="w-full flex items-center h-16 pl-0 bg-main rounded-2xl border border-primary/20 shadow-full focus-within:border-primary/30 overflow-hidden">
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isInputValid) {
              e.preventDefault();
              onSearch();
            }
          }}
          aria-label="Enter your search"
          placeholder="Enter your search..."
          className={`flex-1 bg-transparent text-lg leading-normal h-full pl-4 pr-2 focus:outline-none focus:ring-0 overflow-x-auto whitespace-nowrap min-w-0 ${
            isPlaceholderActive ? "text-primary/60 placeholder:text-primary/80" : "text-primary placeholder:text-primary/80"
          }`}
          style={{ direction: "ltr" }}
        />
        <button
          onClick={onSearch}
          disabled={isLoading || !isInputValid}
          className="bg-muted w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
          aria-label="Search"
        >
          <PiMagnifyingGlassBold
            className={`w-6 h-6 ${isLoading ? "animate-pulse" : ""} ${isInputValid ? "opacity-100" : "opacity-90"}`}
          />
        </button>
      </div>
    </div>
  );
}