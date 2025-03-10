"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TfiWorld } from "react-icons/tfi";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import SearchesModal from "./SearchesModal";

interface Search {
  query: string;
  summary: string;
  results: { title: string; link: string; snippet: string; image: string }[];
  suggestions: string[];
}

interface Session {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  searches: Search[];
}

export default function Header() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/check-session");
        if (!response.ok) throw new Error("Failed to check session");
        const data = await response.json();
        setIsSignedIn(data.isAuthenticated);
        setUserImage(data.userImage);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsSignedIn(false);
        setUserImage(undefined);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data.sessions);
      } catch (error) {
        console.error("Error fetching sessions in Header:", error);
        setSessions([]);
      }
    }
    if (isSignedIn) fetchSessions();
  }, [isSignedIn]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Sign out failed");
      setIsSignedIn(false);
      setUserImage(undefined);
      setSessions([]);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const openSignInModal = () => {
    console.log("Opening SignIn modal");
    setIsSignInModalOpen(true);
    setIsSignUpModalOpen(false);
  };

  const openSignUpModal = () => {
    console.log("Opening SignUp modal");
    setIsSignUpModalOpen(true);
    setIsSignInModalOpen(false);
  };

  return (
    <header className="w-full mx-auto flex items-center justify-between px-6 md:px-12 py-5">
      <Link href="/" className="flex items-center space-x-2">
        <TfiWorld className="w-8 h-8 text-white" />
        <span className="text-white text-xl font-bold">AI Search</span>
      </Link>
      <nav className="flex space-x-2 sm:space-x-6 text-sm font-semibold items-center">
        {isSignedIn && <SearchesModal sessions={sessions} setSessions={setSessions} />}
        <SignIn
          isSignedIn={isSignedIn}
          onSignOut={handleSignOut}
          userImage={userImage}
          isOpen={isSignInModalOpen}
          setIsOpen={setIsSignInModalOpen}
          openSignUp={openSignUpModal}
        />
        {!isSignedIn && (
        <SignUp
          isSignedIn={isSignedIn}
          onSignOut={handleSignOut}
          userImage={userImage}
          isOpen={isSignUpModalOpen}
          setIsOpen={setIsSignUpModalOpen}
          openSignIn={openSignInModal}
        />
        )}
      </nav>
    </header>
  );
}