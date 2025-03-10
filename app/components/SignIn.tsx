"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useRouter } from "next/navigation";
import DeleteModal from "./DeleteModal";
import Dropdown from "./Dropdown";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("SignIn - userImage:", userImage);
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

  return (
    <div className="relative">
      {isSignedIn ? (
        <div className="relative">
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
                  console.log("SignIn - Image failed to load, using /meta.png");
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
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-neutral-400 font-semibold rounded-full transition-all duration-300 hover:text-neutral-100 hover:bg-neutral-800 hover:scale-105"
        >
          <span>Sign In</span>
        </button>
      )}
      {isOpen && !isSignedIn && (
        <div
          className="fixed inset-2 bg-black bg-opacity-50 flex items-center justify-center z-50 lg:pb-32"
          onClick={handleOverlayClick}
        >
          <div className="bg-neutral-800 px-8 sm:px-14 py-5 rounded-lg shadow-xl transform transition-all duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-4 text-neutral-100 transform transition-all duration-300 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-5xl font-bold text-white my-8">
              Sign in to<br />start searching
            </h2>
            <div className="flex flex-col gap-4 mb-8 tracking-wide">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300 border border-neutral-400"
              >
                <FcGoogle size={28} />
                <span className="px-10 sm:px-14">Sign in with Google</span>
              </button>
              <button
                onClick={handleFacebookSignIn}
                className="flex items-center gap-6 sm:gap-3 px-4 py-3 mb-5 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300 border border-neutral-400"
              >
                <FaFacebook size={28} className="text-blue-600" />
                <span className="px-10 sm:px-14">Sign in with Facebook</span>
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