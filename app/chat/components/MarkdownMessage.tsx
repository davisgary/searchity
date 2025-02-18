import React from 'react';

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="markdown-content">
        {lines.map((line, index) => {
          if (line.startsWith('#')) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const text = line.replace(/^#+\s*/, '');
            const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
            const processedText = text
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/__(.*?)__/g, '<strong>$1</strong>')
              .replace(/_(.*?)_/g, '<em>$1</em>');

            return React.createElement(HeadingTag, {
              key: index,
              className: `markdown-header markdown-h${level}`,
              dangerouslySetInnerHTML: { __html: processedText },
            });
          }

          if (line.match(/^\s*[-*]\s/) || line.match(/^\s*\d+\.\s/)) {
            const listText = line.replace(/^\s*[-*]\s*|\s*\d+\.\s*/, '');
            const processedListText = listText
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/__(.*?)__/g, '<strong>$1</strong>')
              .replace(/_(.*?)_/g, '<em>$1</em>');

            return (
              <div key={index} className="markdown-list-item pl-4 flex items-start mb-4">
                <span className="mr-2 text-white">•</span>
                <span dangerouslySetInnerHTML={{ __html: processedListText }} />
              </div>
            );
          }

          let processedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');

          return (
            <div key={index} className="markdown-paragraph mb-4" dangerouslySetInnerHTML={{ __html: processedLine }} />
          );
        })}
      </div>
    );
  };

  return <>{renderMarkdownContent(content)}</>;
};

export default MarkdownMessage;