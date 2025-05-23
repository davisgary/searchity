"use client";

import { useState, useEffect } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
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
  onNewSearch?: () => void;
  showAuth?: boolean;
}

export default function Header({
  sessions,
  setSessions,
  onNewSearch,
  showAuth = true,
}: HeaderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!showAuth) {
      setIsLoading(false);
      return;
    }

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
  }, [showAuth]);

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
    <header className="w-full max-w-4xl lg:max-w-none mx-auto flex items-center justify-between border-l border-r lg:border-l-0 lg:border-r-0 border-b border-primary/10 px-3 md:px-12 py-4" style={{ height: '64px' }}>
      <Link href="/" className="flex items-center space-x-1">
        <FaMagnifyingGlass className="w-4 h-4" />
        <span className="text-lg font-semibold tracking-tighter">Searchity</span>
      </Link>
      <nav className="flex text-sm font-semibold items-center">
        {showAuth && !isLoading && (
          <>
            {isSignedIn ? (
              <>
                <NewSearch onNewSearch={onNewSearch} />
                {sessions && setSessions && (
                  <SearchesModal
                    sessions={sessions}
                    setSessions={setSessions}
                    onNewSearch={onNewSearch}
                    className="mx-4"
                  />
                )}
                <Account
                  isSignedIn={isSignedIn}
                  onSignOut={handleSignOut}
                  userImage={userImage}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={setIsDropdownOpen}
                />
              </>
            ) : (
              <>
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
          </>
        )}
      </nav>
    </header>
  );
}