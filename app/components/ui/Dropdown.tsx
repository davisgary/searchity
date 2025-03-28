"use client";

import { useState, useEffect, useRef } from "react";
import { PiSignOutBold, PiUserMinusBold } from "react-icons/pi";
import { useTheme } from "../../theme";

interface DropdownProps {
  onSignOut: () => void;
  onDeleteConfirm: () => void;
}

export default function Dropdown({ onSignOut, onDeleteConfirm }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOutClick = () => {
    onSignOut();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-3 w-48 bg-background rounded-md shadow-lg z-50 border"
      ref={dropdownRef}
    >
      <div className="p-4 rounded-t-md border-b border-border">
        <span className="text-foreground text-sm">Theme</span>
        <div className="mt-2 flex space-x-2">
        <button
          onClick={() => setTheme("light")}
          className={`px-2 py-1 text-sm rounded ${theme === "light" ? "bg-primary text-primary-foreground" : (theme === "dark" || theme === "auto") ? "bg-accent hover:bg-primary hover:text-primary-foreground" : "bg-accent"}`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`px-2 py-1 text-sm rounded ${theme === "dark" ? "bg-primary text-primary-foreground" : theme === "light" ? "bg-muted hover:bg-primary hover:text-primary-foreground" : "bg-accent hover:bg-primary hover:text-primary-foreground"}`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("auto")}
          className={`px-2 py-1 text-sm rounded ${theme === "auto" ? "bg-primary text-primary-foreground" : theme === "dark" ? "bg-accent hover:bg-primary hover:text-primary-foreground" : "bg-accent hover:bg-primary hover:text-primary-foreground"}`}
        >
          Auto
        </button>
        </div>
      </div>
      <button
        onClick={handleSignOutClick}
        className="w-full flex items-center space-x-2 px-5 py-4 hover:bg-accent"
      >
        <PiSignOutBold size={18} />
        <span>Sign Out</span>
      </button>
      <button
        onClick={onDeleteConfirm}
        className="w-full flex items-center space-x-2 px-5 py-4 border-t border-border text-destructive-foreground hover:bg-accent"
      >
        <PiUserMinusBold size={18} />
        <span>Delete Account</span>
      </button>
    </div>
  );
}