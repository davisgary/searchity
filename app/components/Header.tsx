"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TfiWorld } from 'react-icons/tfi';
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
  const router = useRouter();

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
    fetchSessions();
  }, []);

  const handleSessionClick = (sessionId: number) => {
    router.push(`/?sessionId=${sessionId}`);
    setShowSessions(false);
  };

  const toggleSessions = () => {
    setShowSessions((prev) => !prev);
  };

    return (
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center space-x-2">
          <TfiWorld className="w-8 h-8 text-white" />
          <span className="text-white text-xl font-bold">AI Search</span>
        </Link>
        <nav className="flex space-x-10 text-sm font-semibold">
        <SignIn />
        <button
        onClick={toggleSessions}
        className="bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800"
      >
        Searches
      </button>
      {showSessions && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={toggleSessions}
          ></div>
          <div className="relative bg-neutral-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Your Searches</h2>
            {sessions.length === 0 ? (
              <p className="text-neutral-400">No searches found. Log in to see your past searches.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li
                    key={session.id}
                    className="cursor-pointer p-2 rounded hover:bg-neutral-600"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <span className="text-lg font-semibold">
                      {session.searches[0]?.query.replace(/^\d+\.\s*/, "").replace(/"/g, "") || "Empty Session"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
        </nav>
      </header>
    );
  }