import React, { useState, useRef, useEffect } from 'react';
import { parseMessage, renderMessage, Message } from './Messages';
import Loading from './Loading';
import ChatInput from './ChatInput';

interface ChatProps {
    onSendMessage?: (message: string) => Promise<string>;
    loading: boolean;
    error: string | null;
  }  

const Chat: React.FC<ChatProps> = ({ 
  onSendMessage = async (message) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      return data.message;      
  }
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
  
    scrollToBottom();
  }, [messages]);
  

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      type: 'text' 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantReply = await onSendMessage(input);
      const parsedMessage = parseMessage(assistantReply);
      
      setMessages((prev) => [...prev, parsedMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.',
        type: 'text',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {renderMessage(msg)}
          </div>
        ))}
        {isLoading && <Loading isLoading={isLoading} />}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput input={input} setInput={setInput} handleSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default Chat;