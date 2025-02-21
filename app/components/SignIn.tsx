"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { SiGoogle } from "react-icons/si";

export default function SignIn() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignIn = async () => {
    await signIn("google", { redirect: false });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-neutral-400 transition-colors duration-300 hover:text-neutral-100"
      >
        Sign In
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-neutral-700 p-6 rounded-lg shadow-lg w-80 text-center mb-16">
            <h2 className="text-xl font-bold mb-4">Sign in</h2>
            <button
              onClick={handleSignIn}
              className="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-md bg-neutral-300 hover:bg-gray-100 transition text-gray-700 font-medium text-lg w-full justify-center"
            >
              <SiGoogle className="w-5 h-5 text-blue-500" />
              Sign in with Google
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 text-neutral-200 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}