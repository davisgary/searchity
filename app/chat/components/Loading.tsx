import React, { useState, useEffect } from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  const [loadingMessage, setLoadingMessage] = useState('Thinking...');

  const handleSetLoading = () => {
    setLoadingMessage('Thinking...');
  
    const firstTimeout = setTimeout(() => {
      setLoadingMessage('Getting it together...');
    }, 4000);
  
    const secondTimeout = setTimeout(() => {
      setLoadingMessage('Hang tight, almost there...');
    }, 8000);
  
    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(secondTimeout);
    };
  };

  useEffect(() => {
    if (isLoading) {
      const cleanup = handleSetLoading();
      return cleanup;
    }
  }, [isLoading]);

  return (
    <div className="flex justify-start">
      <div className="text-black px-4 py-2 flex items-center">
        <AiOutlineLoading className="w-6 h-6 mr-2 animate-spin" style={{ fill: 'url(#gradient1)' }} />
        <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', visibility: 'hidden' }}>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366F1' }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6' }} />
              <stop offset="100%" style={{ stopColor: '#14B8A6' }} />
            </linearGradient>
          </defs>
        </svg>
        <p className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 font-semibold">
          {loadingMessage}
        </p>
      </div>
    </div>
  );
};

export default Loading;