"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Account from "./Account";

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

  return (
    <div className="relative">
      {isSignedIn ? (
        <Account isSignedIn={isSignedIn} onSignOut={onSignOut} userImage={userImage} />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center mx-3 px-4 py-2 text-neutral-400 font-semibold rounded-full transition-all duration-300 hover:text-neutral-100 hover:bg-neutral-800 hover:scale-105"
        >
          <span>Sign In</span>
        </button>
      )}
      <div
        className={`fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out lg:pb-32 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`bg-neutral-800 px-8 sm:px-14 py-5 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-5 text-neutral-100 text-lg transition-all duration-300 hover:text-neutral-500"
          >
            ✕
          </button>
          <h2 className="text-4xl sm:text-5xl font-bold text-white my-5 sm:my-8">
            Sign in to<br />start searching
          </h2>
          <div className="flex flex-col gap-4 mb-8 tracking-wide">
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
            >
              <FcGoogle size={28} />
              <span className="px-8 sm:px-14">Sign in with Google</span>
            </button>
            <button
              onClick={handleFacebookSignIn}
              className="flex items-center gap-6 sm:gap-3 px-4 py-3 mb-5 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
            >
              <FaFacebook size={28} className="text-blue-600" />
              <span className="px-8 sm:px-14">Sign in with Facebook</span>
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
    </div>
  );
}