"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteModal from "./DeleteModal";
import Dropdown from "./Dropdown";

interface AccountProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
}

export default function Account({ isSignedIn, onSignOut, userImage }: AccountProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

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

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <div className="relative group">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative w-8 h-8 ml-1 rounded-full overflow-hidden focus:outline-none transition-all duration-300 hover:ring-1 hover:ring-neutral-600"
        >
          <img
            src={userImage || "/meta.png"}
            alt="Account"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.log("Account - Image failed to load, using /meta.png");
              e.currentTarget.src = "/meta.png";
            }}
          />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          Account
        </span>
      </div>
      {isDropdownOpen && (
        <Dropdown onSignOut={handleSignOutClick} onDeleteConfirm={handleDeleteConfirm} />
      )}
      <DeleteModal
        showModal={isDeleteModalOpen}
        setShowModal={setIsDeleteModalOpen}
        onConfirm={handleDeleteAccount}
        heading="Are you sure you want to delete your account?"
        message="This action cannot be undone."
      />
    </div>
  );
}