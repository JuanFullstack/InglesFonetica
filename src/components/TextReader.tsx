// TextReader.tsx
import React from 'react';

interface TextReaderProps {
  text: string;
  onRead: () => void;
  isReading?: boolean;
  className?: string;
}

const TextReader: React.FC<TextReaderProps> = ({ 
  text, 
  onRead, 
  isReading = false, 
  className = '' 
}) => {
  return (
    <button
      onClick={onRead}
      className={`text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
    >
      {isReading ? 'Stop' : 'Read'}
    </button>
  );
};

export default TextReader;