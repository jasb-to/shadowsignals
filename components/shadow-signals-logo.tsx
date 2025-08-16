interface ShadowSignalsLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ShadowSignalsLogo({ className = "", size = "md" }: ShadowSignalsLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        className={`${sizeClasses[size]} flex-shrink-0`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring with glow effect */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#primaryGradient)"
          strokeWidth="2"
          fill="none"
          className="drop-shadow-lg"
        />

        {/* Inner signal waves */}
        <path
          d="M8 20 L12 16 L16 24 L20 12 L24 28 L28 8 L32 20"
          stroke="url(#accentGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-md"
        />

        {/* Central diamond/crystal shape */}
        <path
          d="M20 6 L26 14 L20 22 L14 14 Z"
          fill="url(#crystalGradient)"
          stroke="currentColor"
          strokeWidth="1"
          className="text-white/20"
        />

        {/* AI circuit pattern */}
        <g opacity="0.6">
          <circle cx="12" cy="12" r="1.5" fill="url(#accentGradient)" />
          <circle cx="28" cy="12" r="1.5" fill="url(#accentGradient)" />
          <circle cx="12" cy="28" r="1.5" fill="url(#accentGradient)" />
          <circle cx="28" cy="28" r="1.5" fill="url(#accentGradient)" />
          <line x1="12" y1="12" x2="16" y2="16" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="28" y1="12" x2="24" y2="16" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="12" y1="28" x2="16" y2="24" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
          <line x1="28" y1="28" x2="24" y2="24" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col">
        <span className="text-xl font-bold text-white leading-tight">Shadow Signals</span>
        <span className="text-xs text-slate-400 leading-tight">USDT Trading Pairs & Confluence Analysis</span>
      </div>
    </div>
  )
}
