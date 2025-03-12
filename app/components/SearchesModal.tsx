"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdManageSearch } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiArrowUpRight } from "react-icons/fi";
import DeleteModal from './DeleteModal';
import NewSearch from './NewSearch';

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
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSessionClick = (sessionId: number) => {
    router.push(`/?sessionId=${sessionId}`);
    router.refresh();
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

  const handleClickOutside = (event: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setShowSessions(false);
    }
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
      <div className="relative group z-10">
        <button
          onClick={toggleSessions}
          className="text-white w-9 h-9 rounded-full transition-all duration-300 hover:bg-zinc-800 flex items-center justify-center"
        >
          <MdManageSearch size={30} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs text-white bg-zinc-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Searches
        </span>
      </div>
      {showSessions && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClickOutside}
        />
      )}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 right-0 w-full max-w-md transform transition-transform duration-300 ease-in-out bg-zinc-900 shadow-xl z-50 flex flex-col ${
          showSessions ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-6">
          <button
            onClick={() => setShowSessions(false)}
            className="absolute top-3 right-5 text-lg text-zinc-100 transition-all duration-300 hover:text-zinc-400"
          >
            ✕
          </button>

          {sessions.length > 0 && (
            <>
              <NewSearch
                onClick={() => setShowSessions(false)}
                className="mb-5 pl-2 font-normal"
              />
              <h2 className="text-xl text-zinc-300 font-normal tracking-wide mb-4">
                Searches
              </h2>
            </>
          )}

          {sessions.length === 0 ? (
            <NewSearch
              onClick={() => setShowSessions(false)}
              className="text-center text-lg"
            />
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-zinc-400 font-medium mb-1">{date}</h3>
                  <ul className="space-y-2">
                    {groupedSessions[date].map((session) => (
                      <li
                        key={session.id}
                        className="flex items-center justify-between text-left cursor-pointer p-2 rounded transition-all duration-300 hover:bg-zinc-600"
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
                            className="p-1 text-zinc-400 transition-all duration-300 hover:text-blue-500"
                            title="Open in new tab"
                          >
                            <FiArrowUpRight size={22} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteSingleConfirm(session.id);
                            }}
                            className="p-1 text-zinc-400 transition-all duration-300 hover:text-red-500"
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
        {sessions.length > 0 && (
          <div className="p-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="text-sm text-zinc-400 transition-all duration-300 hover:text-red-500"
              >
                Delete All
              </button>
            </div>
          </div>
        )}
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