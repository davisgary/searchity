"use client";

import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SignInProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
}

export default function SignIn({ isSignedIn, onSignOut, userImage }: SignInProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setIsModalOpen(false);
    }
  };

  const handleSignOutClick = async () => {
    await onSignOut();
    setIsDropdownOpen(false);
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
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative w-10 h-10 rounded-full overflow-hidden focus:outline-none"
          >
          <img
            src={userImage || "/meta.png"}
            alt="Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.log('SignIn - Image failed to load, using /meta.png');
              e.currentTarget.src = "/meta.png";
            }}
          />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-gray-800 font-semibold rounded-full transition duration-300 hover:bg-neutral-300"
        >
          <span>Sign In</span>
        </button>
      )}

      {isModalOpen && !isSignedIn && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-10 rounded-lg shadow-xl transform transition-all duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-neutral-900 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300"
              >
                <FcGoogle size={28} />
                <span>Sign in with Google</span>
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span>Sign in with Facebook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}