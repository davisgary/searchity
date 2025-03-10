"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdManageSearch } from "react-icons/md";
import { PiMagnifyingGlassPlusBold } from "react-icons/pi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { PiShareFat } from "react-icons/pi";
import DeleteModal from './DeleteModal';

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

interface SearchesModalProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

export default function SearchesModal({ sessions, setSessions }: SearchesModalProps) {
  const [showSessions, setShowSessions] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteSingleConfirm, setShowDeleteSingleConfirm] = useState<number | null>(null);
  const router = useRouter();

  const handleSessionClick = (sessionId: number) => {
    router.push(`/?sessionId=${sessionId}`);
    setShowSessions(false);
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error("Failed to delete session");
      setSessions(sessions.filter((session) => session.id !== sessionId));
      setShowDeleteSingleConfirm(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleDeleteAllSessions = async () => {
    try {
      const response = await fetch("/api/sessions/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete all sessions");
      setSessions([]);
      setShowSessions(false);
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error("Error deleting all sessions:", error);
    }
  };

  const handleOpenInNewTab = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/?sessionId=${sessionId}`, "_blank");
  };

  const toggleSessions = () => {
    setShowSessions((prev) => !prev);
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: Session[] } = {};
    sessions.forEach((session) => {
      const date = new Date(session.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const sortedDates = Object.keys(groupedSessions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <div className="relative group">
        <button
          onClick={toggleSessions}
          className="text-white w-9 h-9 rounded-full transition-all duration-300 hover:bg-neutral-800 flex items-center justify-center"
        >
          <MdManageSearch size={26} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-neutral-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Searches
        </span>
      </div>
      <div 
        className={`fixed inset-2 flex items-start justify-center pt-32 pb-10 z-50 transition-opacity duration-300 ease-in-out ${
          showSessions ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-2 bg-black opacity-50"
          onClick={toggleSessions}
        ></div>
        <div 
          className={`relative bg-neutral-900 rounded-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto transition-transform duration-300 ease-in-out ${
            showSessions ? 'translate-y-0' : '-translate-y-10'
          }`}
        >
          <button
            onClick={() => setShowSessions(false)}
            className="absolute top-3 right-5 text-lg text-neutral-100 transition-all duration-300 hover:text-neutral-400"
          >
            ✕
          </button>
          {sessions.length > 0 && (
            <>
              <Link
                href="/"
                className="flex items-center space-x-2 mb-5 pl-2 font-normal text-neutral-100 transition-all duration-300 hover:text-neutral-400"
                onClick={() => setShowSessions(false)}
              >
                <PiMagnifyingGlassPlusBold />
                <span>New Search</span>
              </Link>
              <h2 className="text-xl text-neutral-300 font-normal tracking-wide mb-4">
                Searches
              </h2>
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
                          {session.searches[0]?.query
                            .replace(/^\d+\.\s*/, "")
                            .replace(/"/g, "") || "Empty Session"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleOpenInNewTab(session.id, e)}
                            className="p-1 text-neutral-400 transition-all duration-300 hover:text-blue-500"
                            title="Open in new tab"
                          >
                            <PiShareFat size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteSingleConfirm(session.id);
                            }}
                            className="p-1 text-neutral-400 transition-all duration-300 hover:text-red-500"
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
              <div className="me-2 flex justify-end">
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="text-sm text-neutral-400 transition-all duration-300 hover:text-red-500"
                >
                  Delete All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <DeleteModal
        showModal={showDeleteAllConfirm}
        setShowModal={setShowDeleteAllConfirm}
        onConfirm={handleDeleteAllSessions}
        heading="Are you sure you want to delete?"
        message="This will permanently delete all your past searches."
      />
      <DeleteModal
        showModal={showDeleteSingleConfirm !== null}
        setShowModal={() => setShowDeleteSingleConfirm(null)}
        onConfirm={() => showDeleteSingleConfirm !== null && handleDeleteSession(showDeleteSingleConfirm)}
        heading="Delete this search?"
        message="This will permanently delete this search session."
      />
    </>
  );
}