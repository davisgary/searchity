"use client";

import { useState, useEffect, useRef } from "react";
import { PiSignOutBold } from "react-icons/pi";
import { PiUserMinusBold } from "react-icons/pi";

interface DropdownProps {
  onSignOut: () => void;
  onDeleteConfirm: () => void;
}

export default function Dropdown({ onSignOut, onDeleteConfirm }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
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
      className="absolute right-0 mt-3 w-48 bg-neutral-800 rounded-md shadow-lg z-50"
      ref={dropdownRef}
    >
      <button
        onClick={handleSignOutClick}
        className="w-full text-left px-5 py-4 text-neutral-100 rounded-t-md transition-all duration-300 hover:bg-neutral-700 flex items-center space-x-2"
      >
        <PiSignOutBold size={18} />
        <span>Sign Out</span>
      </button>
      <button
        onClick={onDeleteConfirm}
        className="w-full text-left px-5 py-4 text-red-500 rounded-b-md border-t border-neutral-600 transition-all duration-300 hover:bg-neutral-700 flex items-center space-x-2"
      >
        <PiUserMinusBold size={18} />
        <span>Delete Account</span>
      </button>
    </div>
  );
}