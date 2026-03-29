import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' 
    ? 'bg-term-green/20 border-term-green' 
    : type === 'error' 
    ? 'bg-term-red/20 border-term-red' 
    : 'bg-term-amber/20 border-term-amber';

  const textColor = type === 'success' 
    ? 'text-term-green' 
    : type === 'error' 
    ? 'text-term-red' 
    : 'text-term-amber';

  const icon = type === 'success' 
    ? '✓' 
    : type === 'error' 
    ? '✗' 
    : '⚠';

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} border-2 rounded p-4 font-mono ${textColor} shadow-lg max-w-md`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <p className="flex-1">{message}</p>
          <button 
            onClick={onClose}
            className="text-xl hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
