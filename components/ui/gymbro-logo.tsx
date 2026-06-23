import React from 'react'

interface GymBroLogoProps {
  className?: string
}

export function GymBroLogo({ className = 'h-10 w-10' }: GymBroLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for the outer ring (Orange to Pink to Violet) */}
        <linearGradient id="logoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Gradient for the metallic silver barbell */}
        <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Outer Circle with Gradient Stroke */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="url(#logoRingGradient)"
        strokeWidth="7"
      />

      {/* Barbell rotated at -45 degrees */}
      <g transform="rotate(-45 50 50)">
        {/* Central bar */}
        <rect x="46" y="20" width="8" height="60" rx="3" fill="url(#silverGradient)" />

        {/* Top plates set */}
        {/* Inner wider plate */}
        <rect x="34" y="36" width="32" height="7" rx="1.5" fill="url(#silverGradient)" />
        {/* Outer smaller plate */}
        <rect x="38" y="28" width="24" height="6" rx="1.5" fill="url(#silverGradient)" />
        {/* Bar stopper/collar */}
        <rect x="43" y="44" width="14" height="3" rx="1" fill="url(#silverGradient)" />

        {/* Bottom plates set */}
        {/* Inner wider plate */}
        <rect x="34" y="57" width="32" height="7" rx="1.5" fill="url(#silverGradient)" />
        {/* Outer smaller plate */}
        <rect x="38" y="66" width="24" height="6" rx="1.5" fill="url(#silverGradient)" />
        {/* Bar stopper/collar */}
        <rect x="43" y="53" width="14" height="3" rx="1" fill="url(#silverGradient)" />
      </g>
    </svg>
  )
}
