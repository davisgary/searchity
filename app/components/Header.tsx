"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TfiWorld } from 'react-icons/tfi';
import { MdOutlineManageSearch } from 'react-icons/md';
import { IoSearch } from "react-icons/io5";
import Link from 'next/link';
import SignIn from './SignIn';

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
  const [showSessions, setShowSessions] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/check-session");
        if (!response.ok) throw new Error("Failed to check session");
        const data = await response.json();
        setIsSignedIn(data.isAuthenticated);
        setUserImage(data.userImage);
        console.log('Header - checkSession data:', data);
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

  const handleSessionClick = (sessionId: number) => {
    router.push(`/?sessionId=${sessionId}`);
    setShowSessions(false);
  };

  const toggleSessions = () => {
    setShowSessions((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: 'POST',
      });
      if (!response.ok) throw new Error("Sign out failed");
      setIsSignedIn(false);
      setUserImage(undefined);
      setSessions([]);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center space-x-2">
        <TfiWorld className="w-8 h-8 text-white" />
        <span className="text-white text-xl font-bold">AI Search</span>
      </Link>
      <nav className="flex space-x-6 text-sm font-semibold">
        {isSignedIn && (
          <>
            <button
              onClick={toggleSessions}
              className="text-white w-10 h-9 rounded-full transition-all duration-300 hover:bg-neutral-800 flex items-center justify-center"
            >
              <MdOutlineManageSearch size={26} />
            </button>
            {showSessions && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black opacity-50"
                  onClick={toggleSessions}
                ></div>
                <div className="relative bg-neutral-800 rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
                  {sessions.length > 0 && (
                    <>
                      <Link 
                        href="/" 
                        className="flex items-center space-x-2 mb-5 text-lg text-neutral-100 transition-all duration-300 hover:text-neutral-300"
                        onClick={() => setShowSessions(false)}
                      >
                        <span className="text-white text-lg font-normal">Create New Search</span>
                        <IoSearch className="text-white" />
                      </Link>
                      <h2 className="text-xl font-semibold mb-2">Searches</h2>
                    </>
                  )}
                  {sessions.length === 0 ? (
                    <Link 
                      href="/" 
                      className="flex items-center space-x-2 mb-4 text-center text-lg text-neutral-100 transition-all duration-300 hover:text-neutral-300"
                      onClick={() => setShowSessions(false)}
                    >
                      <span className="text-white text-lg font-normal">Create your first search</span>
                      <IoSearch className="text-white" />
                    </Link>
                  ) : (
                    <ul className="space-y-2">
                      {sessions.map((session) => (
                        <li
                          key={session.id}
                          className="text-left cursor-pointer p-2 rounded transition-all duration-300 hover:bg-neutral-600"
                          onClick={() => handleSessionClick(session.id)}
                        >
                          <span className="text-lg font-normal">
                            {session.searches[0]?.query.replace(/^\d+\.\s*/, "").replace(/"/g, "") || "Empty Session"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        <SignIn 
          isSignedIn={isSignedIn} 
          onSignOut={handleSignOut} 
          userImage={userImage} 
        />
      </nav>
    </header>
  );
}