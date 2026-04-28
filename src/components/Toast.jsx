import React from 'react';

const Toast = ({ visible, text, type = 'error' }) => {
  const isError = type === 'error';
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-mono font-bold transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      } ${isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}
    >
      <span className="material-symbols-outlined text-base">
        {isError ? 'warning' : 'check_circle'}
      </span>
      {text}
    </div>
  );
};

export default Toast;
