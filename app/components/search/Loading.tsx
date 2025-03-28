import React, { useState, useEffect } from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  const [loadingMessage, setLoadingMessage] = useState('Searching...');

  useEffect(() => {
    if (!isLoading) return;

    setLoadingMessage('Searching...');
    
    const firstTimeout = setTimeout(() => {
      setLoadingMessage('Here is the summary...');
    }, 2000);

    const secondTimeout = setTimeout(() => {
      setLoadingMessage('Getting results...');
    }, 4000);

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(secondTimeout);
    };
  }, [isLoading]);

  return (
    <div className="flex items-center text-foreground/80 animate-pulse">
      <AiOutlineLoading className="w-4 h-4 mr-2 animate-spin" />
      {loadingMessage}
    </div>
  );
};

export default Loading;