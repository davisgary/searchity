"use client";

import { useState, useEffect, useRef } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

interface SearchBarProps {
  handleSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ handleSearch, isLoading = false }: SearchBarProps) {
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderActive, setIsPlaceholderActive] = useState(true);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchPlaceholders = async () => {
    try {
      const response = await fetch("/api/placeholders");
      const data = await response.json();
      if (data.placeholders && data.placeholders.length > 0) {
        setPlaceholders(data.placeholders);
        setPlaceholderIndex(0);
        if (isInitialLoad) {
          setTimeout(() => setIsInitialLoad(false), 1000);
        }
      }
    } catch (error) {
      console.error("Failed to fetch placeholders:", error);
    }
  };

  useEffect(() => {
    fetchPlaceholders();
    const interval = setInterval(fetchPlaceholders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isPlaceholderActive && placeholders.length > 0) {
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
            const nextIndex = placeholderIndex + 1;
            if (nextIndex >= placeholders.length) {
              fetchPlaceholders();
              setInput("");
            } else {
              setInput("");
              setPlaceholderIndex(nextIndex);
            }
          }, 3000);
        }
      }, 50);

      return () => {
        clearInterval(typeInterval);
        if (animationRef.current) clearTimeout(animationRef.current);
        if (inputRef.current) inputRef.current.scrollLeft = 0;
      };
    }
  }, [isPlaceholderActive, placeholderIndex, placeholders]);

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

  const handleBlur = () => {
    if (!input.trim()) {
      setIsPlaceholderActive(true);
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
    <div className="sticky top-0 z-10 w-full max-w-3xl pt-4 px-3 lg:px-0">
      <div className="w-full flex items-center h-16 pl-0 bg-main rounded-2xl border border-primary/20 shadow-full focus-within:border-primary/30 overflow-hidden">
        <input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isInputValid) {
              e.preventDefault();
              onSearch();
            }
          }}
          aria-label="Enter your search"
          placeholder={isInitialLoad || (!isPlaceholderActive && !input) ? "Enter your search..." : ""}
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
          <FaMagnifyingGlass
            className={` ${isLoading ? "animate-pulse" : ""} ${isInputValid ? "opacity-100" : "opacity-90"}`}
            size={20}
          />
        </button>
      </div>
    </div>
  );
}