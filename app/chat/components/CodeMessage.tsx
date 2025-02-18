import React from 'react';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { TbCopy } from "react-icons/tb";

const { materialDark } = require('react-syntax-highlighter/dist/esm/styles/prism');

interface CodeMessageProps {
  language: string;
  content: string;
}

const CodeMessage: React.FC<CodeMessageProps> = ({ language, content }) => {
  const languageMapping: { [key: string]: string } = {
    javascript: 'JavaScript',
    html: 'HTML',
    css: 'CSS',
    python: 'Python',
    java: 'Java',
    ruby: 'Ruby',
    php: 'PHP',
    csharp: 'C#',
    cpp: 'C++',
    swift: 'Swift',
    kotlin: 'Kotlin',
    go: 'Go',
    rust: 'Rust',
    sql: 'SQL',
    bash: 'Bash',
    perl: 'Perl',
    r: 'R',
    scala: 'Scala',
    dart: 'Dart',
    json: 'JSON',
    xml: 'XML',
    markdown: 'Markdown',
    yaml: 'YAML',
    shell: 'Shell',
    lua: 'Lua',
    pascal: 'Pascal',
    vbnet: 'VB.NET',
  };

  const displayLanguage = languageMapping[language.toLowerCase()] || language;

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).catch((err) => console.error('Failed to copy code: ', err));
  };

  return (
    <div className="max-w-xl my-4 overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 rounded-3xl shadow-[0_0_4px_rgba(255,255,255,0.4)]">
      <div className="text-sm px-4 py-3 flex justify-between items-center">
        <span>{displayLanguage}</span>
        <button onClick={() => copyToClipboard(content)} className="flex items-center">
          Copy
        <TbCopy className="ml-2" />
        </button>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language || 'plaintext'}
          style={materialDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.9rem',
            overflowX: 'auto',
            position: 'relative',
          }}
          codeTagProps={{
            className: 'text-sm',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeMessage;