'use client';

import { useState } from 'react';
import Chat from './components/Chat';

export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (message: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.message;
    } catch (err) {
      setError('An error occurred while sending your message.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-center text-white">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-start flex-grow px-5 py-24">
        <h1 className="font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
          What can I help you with?
        </h1>
        <Chat onSendMessage={handleSendMessage} loading={loading} error={error} />
      </div>
      <footer className="py-4 text-xs">
        AI can make mistakes. Check your info.
      </footer>
    </div>
  );
}