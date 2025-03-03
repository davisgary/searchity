"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TfiWorld } from 'react-icons/tfi';
import { MdManageSearch } from "react-icons/md";
import { PiMagnifyingGlassPlusBold } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PiShareFat } from "react-icons/pi";
import Link from 'next/link';
import SignIn from './SignIn';
import SignUp from './SignUp';

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

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error("Failed to delete session");
      setSessions(sessions.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleOpenInNewTab = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/?sessionId=${sessionId}`, '_blank');
  };

  const toggleSessions = () => {
    setShowSessions((prev) => !prev);
  };

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

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: Session[] } = {};
    sessions.forEach((session) => {
      const date = new Date(session.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <header className="w-full mx-auto flex items-center justify-between px-6 md:px-12 py-5">
      <Link href="/" className="flex items-center space-x-2">
        <TfiWorld className="w-8 h-8 text-white" />
        <span className="text-white text-xl font-bold">AI Search</span>
      </Link>
      <nav className="flex space-x-6 text-sm font-semibold items-center">
        {isSignedIn && (
          <>
            <div className="relative group">
              <button
                onClick={toggleSessions}
                className="text-white w-9 h-9 rounded-full transition-all duration-300 hover:bg-neutral-800 flex items-center justify-center"
              >
                <MdManageSearch size={26} />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Sessions
              </span>
            </div>
            {showSessions && (
              <div className="fixed inset-0 flex items-start justify-center pt-32 pb-10 z-50">
                <div
                  className="absolute inset-0 bg-black opacity-50"
                  onClick={toggleSessions}
                ></div>
                <div className="relative bg-neutral-800 rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
                  <button
                    onClick={() => setShowSessions(false)}
                    className="absolute top-3 right-4 text-neutral-100 hover:text-neutral-300"
                  >
                    ✕
                  </button>
                  {sessions.length > 0 && (
                    <>
                      <Link
                        href="/"
                        className="flex items-center space-x-2 mb-5 pl-2 font-normal text-neutral-100 transition-all duration-300 hover:text-neutral-300"
                        onClick={() => setShowSessions(false)}
                      >
                        <PiMagnifyingGlassPlusBold />
                        <span>New Search</span>
                      </Link>
                      <h2 className="text-xl text-neutral-300 font-normal tracking-wide mb-4">Searches</h2>
                    </>
                  )}
                  {sessions.length === 0 ? (
                    <Link
                      href="/"
                      className="flex items-center space-x-2 text-center text-lg text-neutral-100 transition-all duration-300 hover:text-neutral-300"
                      onClick={() => setShowSessions(false)}
                    >
                      <span className="text-white text-lg">Create your first search</span>
                      <PiMagnifyingGlassPlusBold className="text-white" />
                    </Link>
                  ) : (
                    <div className="space-y-6">
                      {sortedDates.map((date) => (
                        <div key={date}>
                          <h3 className="text-neutral-400 font-medium mb-1">{date}</h3>
                          <ul className="space-y-2">
                            {groupedSessions[date].map((session) => (
                              <li
                                key={session.id}
                                className="flex items-center justify-between text-left cursor-pointer p-2 rounded transition-all duration-300 hover:bg-neutral-600"
                                onClick={() => handleSessionClick(session.id)}
                              >
                                <span className="text-base font-normal flex-1">
                                  {session.searches[0]?.query.replace(/^\d+\.\s*/, "").replace(/"/g, "") || "Empty Session"}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => handleOpenInNewTab(session.id, e)}
                                    className="p-1 text-neutral-400 hover:text-blue-300"
                                    title="Open in new tab"
                                  >
                                    <PiShareFat size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="p-1 text-neutral-400 hover:text-red-300"
                                    title="Delete session"
                                  >
                                    <RiDeleteBin6Line size={18} />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {!isSignedIn && (
          <SignUp
            isSignedIn={isSignedIn}
            onSignOut={handleSignOut}
            userImage={userImage}
          />
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