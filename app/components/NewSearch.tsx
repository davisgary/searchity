"use client";

import Link from "next/link";
import { HiPencilAlt } from "react-icons/hi";

interface NewSearchProps {
  onClick?: () => void;
  className?: string;
}

export default function NewSearch({ onClick, className = "" }: NewSearchProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`flex items-end space-x-2 text-zinc-100 transition-all duration-300 hover:text-zinc-300 ${className}`}
    >
    <HiPencilAlt />
    <span className="inline-block leading-none">Create New Search</span>
    </Link>
  );
}