import React, { useMemo } from 'react';

type SummaryProps = {
  summary: string;
};

const formatDatesInText = (text: string): string => {
  let formatted = text.replace(/([A-Za-z])(\d)/g, '$1 $2');
  formatted = formatted.replace(/,(\d)/g, ', $1');
  return formatted;
};

const Summary: React.FC<SummaryProps> = ({ summary }) => {
  if (!summary) return null;

  const formattedSummary = useMemo(() => {
    return formatDatesInText(summary);
  }, [summary]);

  const renderMarkdownContent = useMemo(() => {
    const lines = formattedSummary.split('\n');

    return lines.map((line, index) => {
      if (line.startsWith('#')) {
        const level = Math.min((line.match(/^#+/)?.[0].length || 1), 6);
        const text = line.replace(/^#+\s*/, '');
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-bold mt-3 mb-2">
            {text}
          </HeadingTag>
        );
      }

      const processText = (text: string) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/__(.*?)__/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>');
      };

      if (/^\s*[-*]\s|\d+\.\s/.test(line)) {
        const isNumbered = /^\d+\./.test(line);
        const text = line
          .replace(/^\s*[-*]\s*/g, '')
          .replace(/^\d+\.\s*/g, '');

        return (
          <div key={index} className="flex items-start my-2">
            <span className="mr-2">
              {isNumbered ? `${index + 1}.` : '•'}
            </span>
            <span
              dangerouslySetInnerHTML={{ __html: processText(text) }}
            />
          </div>
        );
      }

      return (
        <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: processText(line) }} />
      );
    });
  }, [formattedSummary]);

  return <div className="text-lg">{renderMarkdownContent}</div>;
};

export default Summary;