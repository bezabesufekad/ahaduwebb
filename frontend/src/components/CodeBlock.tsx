import React from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="my-4 rounded-md overflow-hidden bg-gray-800 text-gray-200">
      <div className="px-4 py-2 bg-gray-700 text-xs font-mono">{language}</div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};
