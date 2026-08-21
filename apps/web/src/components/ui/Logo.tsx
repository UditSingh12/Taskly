import React from 'react';

export function Logo({ 
  className = "h-8 w-8", 
  showText = true,
  textClassName = "font-extrabold text-2xl tracking-tight text-foreground"
}: { 
  className?: string;
  showText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2 group">
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 drop-shadow-sm"
        >
          <defs>
            <linearGradient id="card1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="card2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="card3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          <g strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
            <path
              d="M 20 65 L 50 80 L 80 65 L 50 50 Z"
              fill="url(#card1)"
              fillOpacity="0.3"
              stroke="url(#card1)"
              className="origin-center transition-all duration-500 group-hover:translate-y-[6px]"
            />
            <path
              d="M 20 50 L 50 65 L 80 50 L 50 35 Z"
              fill="url(#card2)"
              fillOpacity="0.6"
              stroke="url(#card2)"
              className="origin-center transition-all duration-500"
            />
            <path
              d="M 20 35 L 50 50 L 80 35 L 50 20 Z"
              fill="url(#card3)"
              fillOpacity="1"
              stroke="url(#card3)"
              className="origin-center transition-all duration-500 group-hover:-translate-y-[6px]"
            />
          </g>
        </svg>
      </div>
      {showText && (
        <span className={textClassName}>
          Taskly
        </span>
      )}
    </div>
  );
}
