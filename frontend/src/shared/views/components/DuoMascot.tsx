import React from "react";

interface MascotProps {
  mood?: "happy" | "neutral" | "celebrating" | "sad" | "cheering";
  className?: string;
  size?: number;
}

export const DuoMascot: React.FC<MascotProps> = ({
  mood = "happy",
  className = "",
  size = 120,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse cx="100" cy="180" rx="65" ry="14" fill="#000000" fillOpacity="0.12" />

        {/* Feet */}
        <ellipse cx="75" cy="172" rx="16" ry="9" fill="#ff9600" />
        <ellipse cx="125" cy="172" rx="16" ry="9" fill="#ff9600" />

        {/* Body Main Green */}
        <path
          d="M45 105C45 55 70 30 100 30C130 30 155 55 155 105C155 155 130 172 100 172C70 172 45 155 45 105Z"
          fill="#58cc02"
        />

        {/* Belly Patch Light Green */}
        <path
          d="M68 115C68 85 82 72 100 72C118 72 132 85 132 115C132 145 118 162 100 162C82 162 68 145 68 115Z"
          fill="#8ee000"
        />

        {/* Wings */}
        {mood === "celebrating" ? (
          <>
            {/* Raised celebration wings */}
            <path
              d="M45 95C25 70 20 45 35 40C50 35 55 65 52 85Z"
              fill="#46a302"
            />
            <path
              d="M155 95C175 70 180 45 165 40C150 35 145 65 148 85Z"
              fill="#46a302"
            />
          </>
        ) : (
          <>
            {/* Resting wings */}
            <path
              d="M45 105C30 115 28 135 40 142C52 148 58 130 52 115Z"
              fill="#46a302"
            />
            <path
              d="M155 105C170 115 172 135 160 142C148 148 142 130 148 115Z"
              fill="#46a302"
            />
          </>
        )}

        {/* Eyes White Base */}
        <circle cx="76" cy="80" r="22" fill="#ffffff" />
        <circle cx="124" cy="80" r="22" fill="#ffffff" />

        {/* Eye Pupils & Expressions */}
        {mood === "celebrating" ? (
          <>
            {/* Joyful curved closed eyes */}
            <path
              d="M62 82C62 70 90 70 90 82"
              stroke="#4b4b4b"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M110 82C110 70 138 70 138 82"
              stroke="#4b4b4b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        ) : mood === "sad" ? (
          <>
            {/* Tearful/sad eyes */}
            <circle cx="76" cy="82" r="14" fill="#3c3c3c" />
            <circle cx="124" cy="82" r="14" fill="#3c3c3c" />
            <circle cx="73" cy="79" r="4" fill="#ffffff" />
            <circle cx="121" cy="79" r="4" fill="#ffffff" />
            {/* Droop eyelids */}
            <path d="M54 70Q76 82 98 70" stroke="#58cc02" strokeWidth="8" fill="none" />
            <path d="M102 70Q124 82 146 70" stroke="#58cc02" strokeWidth="8" fill="none" />
          </>
        ) : (
          <>
            {/* Wide awake playful eyes */}
            <circle cx="78" cy="80" r="12" fill="#3c3c3c" />
            <circle cx="122" cy="80" r="12" fill="#3c3c3c" />
            <circle cx="75" cy="76" r="4" fill="#ffffff" />
            <circle cx="119" cy="76" r="4" fill="#ffffff" />
          </>
        )}

        {/* Beak Orange */}
        {mood === "sad" ? (
          <path
            d="M90 98C90 94 110 94 110 98C110 106 100 110 100 110C100 110 90 106 90 98Z"
            fill="#ff9600"
          />
        ) : (
          <path
            d="M88 94C88 94 100 90 112 94C112 104 102 114 100 114C98 114 88 104 88 94Z"
            fill="#ff9600"
          />
        )}

        {/* Cheeks blush */}
        {(mood === "happy" || mood === "celebrating") && (
          <>
            <circle cx="56" cy="98" r="8" fill="#ff4b4b" fillOpacity="0.25" />
            <circle cx="144" cy="98" r="8" fill="#ff4b4b" fillOpacity="0.25" />
          </>
        )}

        {/* Small feather tuft on head */}
        <path
          d="M94 30C90 18 100 16 102 28"
          stroke="#46a302"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M100 28C104 14 114 18 108 30"
          stroke="#46a302"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
