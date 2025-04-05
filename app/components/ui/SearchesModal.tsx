"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PiListMagnifyingGlassBold } from "react-icons/pi";
import { PiMinusCircleBold } from "react-icons/pi";
import { PiArrowSquareOutBold } from "react-icons/pi";
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
  onNewSearch?: () => void;
  className?: string;
}

export default function SearchesModal({ sessions, setSessions, onNewSearch, className }: SearchesModalProps) {
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

  const handleNewSearchClick = () => {
    if (onNewSearch) {
      onNewSearch();
      setShowSessions(false);
    }
  };

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: Session[] } = {};
    const offset = new Date().getTimezoneOffset() * 60000;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      if (isNaN(sessionDate.getTime())) return;

      const localTime = new Date(sessionDate.getTime() - offset);
      const localDate = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
      const date = localDate.toLocaleDateString("en-US", {
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
    (a, b) => {
      const dateA = new Date(a.split(",")[1].trim() + " " + new Date().getFullYear());
      const dateB = new Date(b.split(",")[1].trim() + " " + new Date().getFullYear());
      return dateB.getTime() - dateA.getTime();
    }
  );

  return (
    <>
    <div className={`relative group z-10 ${className || ''}`}>
      <button
        onClick={toggleSessions}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted hover:text-primary transition-all duration-300"
        aria-label="Toggle search sessions"
      >
        <PiListMagnifyingGlassBold size={28} />
      </button>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs px-2 py-1 rounded bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        Searches
      </span>
    </div>
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
        showSessions
          ? "bg-main/50 bg-opacity-75 backdrop-blur-sm opacity-100"
          : "bg-opacity-0 opacity-0 pointer-events-none"
      }`}
      onClick={handleClickOutside}
    >
      <div
        ref={panelRef}
        className={`bg-secondary p-3 rounded-lg shadow-full transform transition-all duration-300 ease-in-out w-11/12 sm:w-full max-w-2xl max-h-[80vh] flex flex-col ${
          showSessions ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center px-3">
          <div style={{ width: 'fit-content', marginTop: '0.35rem' }}>
            <NewSearch onNewSearch={handleNewSearchClick} />
          </div>
          <div className="relative group" style={{ width: 'fit-content', marginTop: '0.25rem' }}>
            <button
              onClick={() => setShowSessions(false)}
              className="flex items-center justify-center text-xl text-primary w-8 h-8 rounded-full transition-all duration-300 hover:bg-muted hover:scale-105"
              aria-label="Close sessions modal"
            >
              ✕
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2rem] text-xs px-2 py-1 rounded bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
              Close
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mt-5 px-6">
          {sessions.length === 0 ? (
            <button
              onClick={() => setShowSessions(false)}
              className="flex flex-row items-center justify-center space-x-2 w-full py-2"
            >
              <NewSearch onNewSearch={handleNewSearchClick} />
              <span className="text-lg font-medium">Start your first search</span>
            </button>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-primary/80 font-medium mb-1">{date}</h3>
                  <ul className="space-y-2">
                    {groupedSessions[date].map((session) => (
                      <li
                        key={session.id}
                        className="flex items-center justify-between text-sm text-left cursor-pointer p-2 rounded-2xl border border-primary/50 transition-all duration-300 hover:bg-muted"
                        onClick={() => handleSessionClick(session.id)}
                      >
                        <span className="font-normal flex-1">
                          {session.searches[0]?.query
                            .replace(/^\d+\.\s*/, "")
                            .replace(/"/g, "") || "Empty Session"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="relative group">
                            <button
                              onClick={(e) => handleOpenInNewTab(session.id, e)}
                              className="p-1 text-primary/80 transition-all duration-300 hover:text-sky-600"
                              aria-label="Open in new tab"
                            >
                              <PiArrowSquareOutBold size={20} />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] text-xs bg-muted px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:bottom-[-1.75rem] whitespace-nowrap">
                              Open in new tab
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteSingleConfirm(session.id);
                              }}
                              className="p-1 text-primary/80 transition-all duration-300 hover:text-danger"
                              aria-label="Delete session"
                            >
                              <PiMinusCircleBold size={20} />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] text-xs bg-muted px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:bottom-[-1.75rem] whitespace-nowrap">
                              Delete
                            </span>
                          </div>
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
          <div className="p-5 flex justify-end shrink-0">
            <div className="relative group">
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="text-sm transition-all duration-300 hover:text-danger"
                aria-label="Confirm delete all items"
              >
                Delete All
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 top-[-2.5rem] text-xs bg-muted px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:top-[-2rem] whitespace-nowrap">
                Go to Delete All
              </span>
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