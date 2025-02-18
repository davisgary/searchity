import React, { useRef, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSendMessage, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Enter your message..."
          className="w-full px-5 pr-16 bg-neutral-900 text-white placeholder-neutral-400 rounded-3xl shadow-[0_0_4px_rgba(255,255,255,0.6)] focus:outline-none resize-none overflow-hidden"
          disabled={isLoading}
          rows={1}
          style={{ minHeight: '58px', maxHeight: '200px', height: '58px', lineHeight: 'normal', paddingTop: '20px', paddingBottom: '20px' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className="absolute right-3 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-80 transition-colors duration-200"
          style={{ top: '47%', transform: 'translateY(-50%)' }}
        >
        <FaArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;