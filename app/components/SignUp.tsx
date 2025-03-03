"use client";

import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SignUpProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
}

export default function SignUp({ isSignedIn, onSignOut, userImage }: SignUpProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SignUp - userImage:', userImage);
  }, [userImage]);

  const handleGoogleSignUp = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = authUrl;
  };

  const handleFacebookSignUp = () => {
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
                  console.log('SignUp - Image failed to load, using /meta.png');
                  e.currentTarget.src = "/meta.png";
                }}
              />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              Account
            </span>
          </div>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md transition-all duration-300 hover:bg-neutral-300"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-neutral-400 font-semibold transition-all duration-300 hover:text-neutral-100"
        >
          <span>Sign Up</span>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Us</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGoogleSignUp}
                className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300"
              >
                <FcGoogle size={28} />
                <span>Sign up with Google</span>
              </button>
              <button
                onClick={handleFacebookSignUp}
                className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span>Sign up with Facebook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}