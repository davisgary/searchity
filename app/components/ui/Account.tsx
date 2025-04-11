"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import DeleteModal from "./DeleteModal";
import Dropdown from "./Dropdown";

interface AccountProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
  isDropdownOpen: boolean;
  setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Account({
  isSignedIn,
  onSignOut,
  userImage,
  isDropdownOpen,
  setIsDropdownOpen,
}: AccountProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen((prev: boolean) => !prev);
    }, 100);
  };

  const handleSignOutClick = async () => {
    await onSignOut();
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }
      await onSignOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
    setIsDeleteModalOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !isDeleteModalOpen
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen, isDeleteModalOpen]);

  if (!isSignedIn) return null;

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-8 h-8 ml-1 focus:outline-none transition-all duration-300 hover:ring-1 hover:ring-muted rounded-full z-10 bg-transparent"
      >
        <img
          src={userImage || "/meta.png"}
          alt="Account"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = "/meta.png")}
        />
      </button>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs px-2 py-1 rounded bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        Account
      </span>
      {isDropdownOpen && (
        <div ref={dropdownRef} className="absolute top-full right-0 z-50">
          <Dropdown onSignOut={handleSignOutClick} onDeleteConfirm={handleDeleteConfirm} />
        </div>
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          showModal={isDeleteModalOpen}
          setShowModal={setIsDeleteModalOpen}
          onConfirm={handleDeleteAccount}
          heading="Are you sure you want to delete your account?"
          message="This action cannot be undone."
        />
      )}
    </div>
  );
}