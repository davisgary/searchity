import React from 'react';
import CodeMessage from './CodeMessage';
import MarkdownMessage from './MarkdownMessage';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'code' | 'list' | 'markdown';
  language?: string;
}

export const parseMessage = (content: string): Message => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
  const codeMatch = content.match(codeBlockRegex);
  if (codeMatch) {
    return {
      role: 'assistant',
      content: codeMatch[2].trim(),
      type: 'code',
      language: codeMatch[1] || 'plaintext',
    };
  }

  const listRegex = /^(\s*[-*]|\d+\.)\s/gm;
  if (listRegex.test(content)) {
    return {
      role: 'assistant',
      content: content,
      type: 'list',
    };
  }

  const markdownRegex = /^(#{1,6}|\*\*|\*|__)/gm;
  if (markdownRegex.test(content)) {
    return {
      role: 'assistant',
      content: content,
      type: 'markdown',
    };
  }

  return {
    role: 'assistant',
    content: content,
    type: 'text',
  };
};

export const renderMessage = (msg: Message) => {
  const roleStyles =
    msg.role === 'user'
      ? 'bg-neutral-800 text-white rounded-3xl rounded-br-sm shadow-[0_0_4px_rgba(255,255,255,0.4)]'
      : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 rounded-3xl rounded-bl-sm shadow-[0_0_4px_rgba(255,255,255,0.4)]';

  return (
    <div className="mb-4 flex">
      {msg.type === 'code' && <CodeMessage language={msg.language || 'plaintext'} content={msg.content} />}
      {(msg.type === 'markdown' || msg.type === 'list') && (
        <div className={`max-w-xl p-5 ${roleStyles}`}>
          <MarkdownMessage content={msg.content} />
        </div>
      )}
      {msg.type === 'text' && (
        <div className={`max-w-xl p-5 ${roleStyles}`}>
          {msg.content}
        </div>
      )}
    </div>
  );
};

export default renderMessage;