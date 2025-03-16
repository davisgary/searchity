"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SignUpProps {
  isSignedIn: boolean;
  onSignOut: () => Promise<void>;
  userImage?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  openSignIn: () => void;
}

export default function SignUp({
  isSignedIn,
  userImage,
  isOpen,
  setIsOpen,
  openSignIn,
}: SignUpProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("SignUp - userImage:", userImage);
  }, [userImage]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleGoogleSignUp = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/google?returnTo=${encodeURIComponent(
      currentPath
    )}`;
    window.location.href = authUrl;
  };

  const handleFacebookSignUp = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/facebook?returnTo=${encodeURIComponent(
      currentPath
    )}`;
    window.location.href = authUrl;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleSignInClick = () => {
    console.log("SignUp: Switching to SignIn");
    setIsOpen(false);
    openSignIn();
  };

  if (isSignedIn) return null;

  return (
    <div className="relative">
      <div className="relative group">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-gray-800 font-semibold rounded-full transition-all duration-300 hover:bg-neutral-300 hover:scale-105 focus:bg-neutral-300"
          aria-label="Open sign up dialog"
        >
          <span>Sign Up</span>
          <FaChevronRight size={10} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] text-xs text-white bg-neutral-950 px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 pointer-events-none group-hover:bottom-[-2rem] whitespace-nowrap">
          Go to Sign Up
        </span>
      </div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out pb-10 md:pb-32 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`bg-neutral-800 p-5 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="relative group w-fit ml-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center text-lg text-neutral-100 w-8 h-8 rounded-full transition-all duration-300 hover:text-neutral-200 hover:bg-neutral-700 focus:text-neutral-400"
              aria-label="Close modal"
            >
              ✕
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-[2.25rem] sm:top-[2.5rem] text-xs text-white bg-neutral-950 px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 pointer-events-none group-hover:top-[2rem] sm:group-hover:top-[2.25rem] whitespace-nowrap">
              Close
            </span>
          </div>
          <div className="px-6 sm:px-10 md:px-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 sm:mb-8">
              Sign up to<br />start searching
            </h2>
            <div className="flex flex-col gap-4 mb-10 tracking-wide">
              <button
                onClick={handleGoogleSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
              >
                <FcGoogle size={28} />
                <span className="px-8 sm:px-14">Sign up with Google</span>
              </button>
              <button
                onClick={handleFacebookSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 mb-5 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-8 sm:px-14">Sign up with Facebook</span>
              </button>
            </div>
            <div className="text-center space-y-2">
              <p className="text-neutral-400">
                Already have an account?{" "}
                <button
                  onClick={handleSignInClick}
                  className="text-neutral-100 hover:text-neutral-300"
                >
                  Sign In
                </button>
              </p>
              <Link href="/" className="block text-neutral-100 hover:text-neutral-300">
                Terms and Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}