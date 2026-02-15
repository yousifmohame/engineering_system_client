import React from 'react';

const CodeDisplay = ({ code, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-50 pointer-events-none opacity-50`}>
      <span className="bg-gray-100 border border-gray-300 text-gray-500 text-[10px] font-mono px-2 py-1 rounded">
        {code}
      </span>
    </div>
  );
};

export default CodeDisplay;