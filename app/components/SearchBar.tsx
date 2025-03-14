"use client";

import { useState, useRef, useEffect } from "react";
import { TfiWorld } from "react-icons/tfi";

interface SearchBarProps {
  handleSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ handleSearch, isLoading = false }: SearchBarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const isInputValid = input.trim().length > 0;

  const onSearch = () => {
    if (isInputValid) {
      handleSearch(input);
      setInput("");
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-neutral-900 w-full pt-4">
      <div className="w-full relative flex items-center bg-neutral-800 rounded-2xl border-2 border-white/20 px-5 pr-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && isInputValid) {
              e.preventDefault();
              onSearch();
            }
          }}
          placeholder="Enter your search..."
          className="w-full bg-neutral-800 text-lg text-white placeholder-neutral-300 focus:outline-none resize-none overflow-hidden py-4 pr-2"
          rows={1}
          style={{ minHeight: "65px", maxHeight: "200px", paddingTop: "19px", paddingBottom: "18px" }}
        />
        <button
          onClick={onSearch}
          disabled={isLoading || !isInputValid}
          className="bg-neutral-900 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          aria-label="Search"
        >
          <TfiWorld
            className={`w-6 h-6 ${isLoading ? "animate-spin" : ""} ${isInputValid ? "opacity-100" : "opacity-60"}`}
          />
        </button>
      </div>
    </div>
  );
}