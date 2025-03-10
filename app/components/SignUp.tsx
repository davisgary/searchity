"use client";

import { useEffect } from "react";
import Link from "next/link";
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
  openSignIn 
}: SignUpProps) {

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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-gray-800 font-semibold rounded-full transition-all duration-300 hover:bg-neutral-300 hover:scale-105"
      >
        <span>Sign Up</span>
      </button>
      {isOpen && !isSignedIn && (
        <div
          className="fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center z-50 pb-10 md:pb-32"
          onClick={handleOverlayClick}
        >
          <div className="bg-neutral-800 px-8 sm:px-14 py-5 rounded-lg shadow-xl transform transition-all duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-4 text-neutral-100 text-lg transform transition-all duration-300 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-5xl font-bold text-white my-8">Sign up to<br />start searching</h2>
            <div className="flex flex-col gap-4 mb-8 tracking-wide">
              <button
                onClick={handleGoogleSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
              >
                <FcGoogle size={28} />
                <span className="px-10 sm:px-14">Sign up with Google</span>
              </button>
              <button
                onClick={handleFacebookSignUp}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 mb-5 text-white font-semibold rounded-full hover:bg-neutral-700 hover:scale-105 transition duration-300 border border-neutral-400"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-10 sm:px-14">Sign up with Facebook</span>
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
      )}
    </div>
  );
}