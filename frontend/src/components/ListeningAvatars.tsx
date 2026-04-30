import React from 'react';

export const AvatarMale = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="50" fill="#E0E7FF" />
    <path
      d="M50 25C58.2843 25 65 31.7157 65 40C65 48.2843 58.2843 55 50 55C41.7157 55 35 48.2843 35 40C35 31.7157 41.7157 25 50 25Z"
      fill="#4F46E5"
    />
    <path
      d="M25 85C25 71.1929 36.1929 60 50 60C63.8071 60 75 71.1929 75 85"
      fill="#4F46E5"
    />
    <rect x="30" y="38" width="40" height="6" rx="3" fill="#1E1B4B" opacity="0.8" />
    <path d="M35 35 Q50 45 65 35" stroke="#1E1B4B" strokeWidth="3" fill="none" />
  </svg>
);

export const AvatarFemale = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="50" fill="#FCE7F3" />
    <path
      d="M50 25C58.2843 25 65 31.7157 65 40C65 48.2843 58.2843 55 50 55C41.7157 55 35 48.2843 35 40C35 31.7157 41.7157 25 50 25Z"
      fill="#EC4899"
    />
    <path
      d="M25 85C25 71.1929 36.1929 60 50 60C63.8071 60 75 71.1929 75 85"
      fill="#EC4899"
    />
    <path d="M32 35 Q50 55 68 35" stroke="#831843" strokeWidth="3" fill="none" />
    <circle cx="40" cy="38" r="8" fill="#831843" opacity="0.2" />
    <circle cx="60" cy="38" r="8" fill="#831843" opacity="0.2" />
  </svg>
);
