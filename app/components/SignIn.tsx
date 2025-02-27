'use client';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleSignIn = () => {
    const currentPath = window.location.pathname;
    const authUrl = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;
    window.location.href = authUrl;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-100 transition duration-300"
      >
        <span>Sign In</span>
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white p-10 rounded-lg shadow-xl transform transition-all duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-4 text-neutral-900 hover:text-neutral-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome</h2>
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-700 transition duration-300"
            >
              <FcGoogle size={28} />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}