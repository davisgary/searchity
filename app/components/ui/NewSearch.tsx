"use client";

import Link from "next/link";
import { PiNotePencilBold } from "react-icons/pi";
import { useRouter } from "next/navigation";

interface NewSearchProps {
  onClick?: () => void;
  className?: string;
}

export default function NewSearch({ onClick, className = "" }: NewSearchProps) {
  const router = useRouter();

  const handleNewSearch = () => {
    if (onClick) onClick();
    router.push("/");
    router.refresh();
  };

  return (
    <div className={`relative group z-10 ${className}`}>
      <Link
        href="/"
        onClick={handleNewSearch}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted hover:text-primary transition-all duration-300"
        aria-label="Create New Search"
      >
        <PiNotePencilBold size={24} />
      </Link>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs px-2 py-1 rounded bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        New
      </span>
    </div>
  );
}