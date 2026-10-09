import React from "react";

interface StreakIconProps {
  className?: string;
}

export const StreakIcon: React.FC<StreakIconProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    focusable="false"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      d="M15.5 2.2c.2 3.1-1.1 5.1-3.2 6.8-1.3-1.5-1.7-3-1.4-5.2C7.6 6.1 5 9.1 5 13.1a7 7 0 0 0 14 0c0-4.4-2.2-8.3-3.5-10.9ZM12 11.7c-1.4 1.6-2.2 2.6-2.2 3.8a2.2 2.2 0 0 0 4.4 0c0-1.2-.8-2.3-2.2-3.8Z"
    />
  </svg>
);
