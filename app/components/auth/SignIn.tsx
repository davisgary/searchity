"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SignInProps {
  isSignedIn: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  openSignUp: () => void;
}

export default function SignIn({
  isSignedIn,
  isOpen,
  setIsOpen,
  openSignUp,
}: SignInProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleSignUpClick = () => {
    setIsOpen(false);
    openSignUp();
  };

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (isSignedIn) return null;

  return (
    <div className="relative">
      <div className="relative group">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center mx-3 px-4 py-2 font-semibold rounded-full transition-all duration-300 hover:bg-accent hover:scale-105"
          aria-label="Open sign in dialog"
        >
          <span>Sign In</span>
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] text-xs bg-accent px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:bottom-[-2rem] whitespace-nowrap">
          Go to Sign In
        </span>
      </div>
      <div
        className={`fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out pb-10 md:pb-32 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={`bg-muted p-5 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="relative group w-fit ml-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center text-lg text-primary w-8 h-8 rounded-full transition-all duration-300 hover:bg-accent hover:scale-105"
              aria-label="Close modal"
            >
              ✕
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-[2.25rem] sm:top-[2.5rem] text-xs bg-accent text-primary px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-600 pointer-events-none group-hover:top-[2rem] sm:group-hover:top-[2.5rem] whitespace-nowrap">
              Close
            </span>
          </div>
          <div className="px-6 sm:px-10 md:px-14">
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 sm:mb-8">
              Sign in to<br />start searching
            </h2>
            <div className="flex flex-col gap-4 mb-10 tracking-wide">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 font-semibold rounded-full hover:bg-accent hover:scale-105 transition duration-300 border border-primary/40"
              >
                <FcGoogle size={28} />
                <span className="px-8 sm:px-14">Sign in with Google</span>
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 font-semibold rounded-full hover:bg-accent hover:scale-105 transition duration-300 border border-primary/40"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-8 sm:px-14">Sign in with Facebook</span>
              </button>
            </div>
            <div className="text-center space-y-2">
              <p>
                Don't have an account?{" "}
                <button
                  onClick={handleSignUpClick}
                  className="text-primary/70 hover:text-primary"
                >
                  Sign Up
                </button>
              </p>
              <Link href="/" className="block text-primary/70 hover:text-primary">
                Terms and Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}