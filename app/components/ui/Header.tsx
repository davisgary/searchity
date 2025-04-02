"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SignIn from "../auth/SignIn";
import SignUp from "../auth/SignUp";
import SearchesModal from "./SearchesModal";
import NewSearch from "./NewSearch";
import Account from "./Account";

interface Search {
  query: string;
  summary: string;
  results: { title: string; link: string; snippet: string; image: string }[];
  suggestions: string[];
  timestamp?: string;
}

interface Session {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  searches: Search[];
}

interface HeaderProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export default function Header({ sessions, setSessions }: HeaderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/auth/check-session");
        if (!response.ok) throw new Error("Failed to check session");
        const data = await response.json();
        setIsSignedIn(data.isAuthenticated);
        setUserImage(data.userImage);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSignedIn(false);
        setUserImage(undefined);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Sign out failed");
      setIsSignedIn(false);
      setUserImage(undefined);
      setSessions([]);
      setIsDropdownOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
    setIsSignUpModalOpen(false);
  };

  const openSignUpModal = () => {
    setIsSignUpModalOpen(true);
    setIsSignInModalOpen(false);
  };

  return (
    <header className="w-full mx-auto flex items-center justify-between border-b border-dashed border-primary/10 px-3 md:px-12 py-4" style={{ height: '64px' }}>
      <Link href="/">
        <span className="text-xl font-semibold">Search</span>
      </Link>
      <nav className="flex text-sm font-semibold items-center">
        {isLoading ? (
          null
        ) : (
          <>
            {isSignedIn && (
              <>
                <NewSearch onClick={() => {}} />
                <SearchesModal
                  sessions={sessions}
                  setSessions={setSessions}
                  className="mx-4"
                />
                <Account
                  isSignedIn={isSignedIn}
                  onSignOut={handleSignOut}
                  userImage={userImage}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              </>
            )}
            {!isSignedIn && (
              <>
                <SignIn
                  isSignedIn={isSignedIn}
                  isOpen={isSignInModalOpen}
                  setIsOpen={setIsSignInModalOpen}
                  openSignUp={openSignUpModal}
                />
                <SignUp
                  isSignedIn={isSignedIn}
                  onSignOut={handleSignOut}
                  userImage={userImage}
                  isOpen={isSignUpModalOpen}
                  setIsOpen={setIsSignUpModalOpen}
                  openSignIn={openSignInModal}
                />
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
}