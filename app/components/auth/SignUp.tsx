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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-main font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          aria-label="Open sign up dialog"
        >
          <span>Sign Up</span>
          <FaChevronRight size={10} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] text-xs bg-primary text-main px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:bottom-[-2rem] whitespace-nowrap">
          Go to Sign Up
        </span>
      </div>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out px-2 pb-10 md:pb-32 ${
          isOpen
            ? "bg-main/50 bg-opacity-75 backdrop-blur-sm opacity-100"
            : "bg-opacity-0 opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className={`bg-primary p-3 rounded-lg shadow-full transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="relative group w-fit ml-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center text-xl text-main w-8 h-8 mr-1 rounded-full transition-all duration-300 hover:bg-main/20 hover:scale-105"
              aria-label="Close modal"
            >
              ✕
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 top-[2.25rem] sm:top-[2.5rem] text-xs text-main bg-main/20 px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-600 pointer-events-none group-hover:top-[2rem] sm:group-hover:top-[2.5rem] whitespace-nowrap">
              Close
            </span>
          </div>
          <div className="sm:px-8 md:px-10">
            <h2 className="text-4xl sm:text-5xl text-main font-semibold tracking-tight mb-5">
              Sign up to<br />start searching
            </h2>
            <div className="flex flex-col gap-4 px-4 mb-5 tracking-wide">
              <button
                onClick={handleGoogleSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-main font-semibold rounded-full border border-main/40 hover:bg-main/10 hover:scale-105 transition duration-300"
              >
                <FcGoogle size={28} />
                <span className="px-6 sm:px-14 md:px-16">Sign up with Google</span>
              </button>
              <button
                onClick={handleFacebookSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-main font-semibold rounded-full border border-main/40 hover:bg-main/10 hover:scale-105 transition duration-300"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-6 sm:px-14 md:px-16">Sign up with Facebook</span>
              </button>
            </div>
            <div className="font-medium text-center">
              <p className="text-sm text-main/70 mb-24">
                Already have an account?{" "}
                <button
                  onClick={handleSignInClick}
                  className="text-main hover:text-main/80 transition-all duration-300"
                >
                  Sign In
                </button>
              </p>
              <div className="text-xs text-main/80 mb-2">
                  By signing in, you agree to the{' '}
                <Link href="/terms-of-use" className="font-semibold text-sky-500 dark:text-sky-700 hover:underline">
                  Terms of Use
                </Link>{' '}
                  and{' '}
                <Link href="/privacy-policy" className="font-semibold text-sky-500 dark:text-sky-700 hover:underline">
                  Privacy Policy
                </Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}