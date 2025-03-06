"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SignInProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  openSignUp: () => void;
}

export default function SignIn({ 
  isSignedIn, 
  onSignOut, 
  userImage, 
  isOpen, 
  setIsOpen, 
  openSignUp 
}: SignInProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('SignIn - userImage:', userImage);
  }, [userImage]);

  const handleGoogleSignIn = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = authUrl;
  };

  const handleFacebookSignIn = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/facebook?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = authUrl;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleDeleteOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleSignOutClick = async () => {
    await onSignOut();
    setIsDropdownOpen(false);
  };

  const handleSignUpClick = () => {
    setIsOpen(false);
    openSignUp();
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/delete-account", {
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative">
      {isSignedIn ? (
        <div className="relative" ref={dropdownRef}>
          <div className="relative group">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative w-8 h-8 rounded-full overflow-hidden focus:outline-none transition-all duration-300 hover:ring-2 hover:ring-neutral-600"
            >
              <img
                src={userImage || "/meta.png"}
                alt="Account"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.log('SignIn - Image failed to load, using /meta.png');
                  e.currentTarget.src = "/meta.png";
                }}
              />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              Account
            </span>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg z-50">
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-4 py-2 text-sm text-neutral-100 rounded-t-md transition-all duration-300 hover:text-neutral-400"
              >
                Sign Out
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="w-full text-left px-4 py-2 text-sm text-red-600 rounded-b-md transition-all duration-300 hover:text-red-400"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-gray-800 font-semibold rounded-full transition-all duration-300 hover:bg-neutral-300"
        >
          <span>Sign In</span>
        </button>
      )}
      {isOpen && !isSignedIn && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 lg:pb-32"
          onClick={handleOverlayClick}
        >
          <div className="bg-neutral-800 px-14 py-5 rounded-lg shadow-xl transform transition-all duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-4 text-neutral-100 transform transition-all duration-300 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-5xl font-bold text-white my-8">Sign in to<br />start searching</h2>
            <div className="flex flex-col gap-4 mb-8 tracking-wide">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 px-4 py-3 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300 border border-neutral-400"
              >
                <FcGoogle size={28} />
                <span className="px-14">Sign in with Google</span>
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="flex items-center gap-3 px-4 py-3 mb-5 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300 border border-neutral-400"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-14">Sign in with Facebook</span>
              </button>
            </div>
            <div className="text-center space-y-2">
              <p className="text-neutral-400">
                Don't have an account?{" "}
                <button
                  onClick={handleSignUpClick}
                  className="text-neutral-100 hover:text-neutral-300"
                >
                  Sign Up
                </button>
              </p>
              <Link href="/" className="block text-neutral-100 hover:text-neutral-300">
                Terms and Service
              </Link>
            </div>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleDeleteOverlayClick}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl transform transition-all duration-300 relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-3 right-4 text-neutral-900 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-gray-800 my-4">
              Are you sure you want to delete your account?
            </h2>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-neutral-200 text-gray-800 font-semibold rounded-full hover:bg-neutral-300 transition duration-300"
              >
                No
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition duration-300"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}