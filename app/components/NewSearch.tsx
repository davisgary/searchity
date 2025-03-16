"use client";

import Link from "next/link";
import { FaRegPenToSquare } from "react-icons/fa6";

interface NewSearchProps {
  onClick?: () => void;
  className?: string;
}

export default function NewSearch({ onClick, className = "" }: NewSearchProps) {
  return (
    <div className={`relative group z-10 ${className}`}>
      <Link
        href="/"
        onClick={onClick}
        className="flex items-center justify-center text-white w-8 h-8 rounded-full transition-all duration-300 hover:bg-neutral-800 hover:ring-1 hover:ring-neutral-600"
        aria-label="Create New Search"
      >
        <FaRegPenToSquare size={18} />
      </Link>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-950 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        New
      </span>
    </div>
  );
}