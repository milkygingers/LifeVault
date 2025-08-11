import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "", showText = true, animated = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="vaultGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#6366f1", stopOpacity:1}} />
            <stop offset="30%" style={{stopColor:"#8b5cf6", stopOpacity:1}} />
            <stop offset="70%" style={{stopColor:"#06b6d4", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#10b981", stopOpacity:1}} />
            {animated && (
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values="0 32 32;360 32 32"
                dur="20s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
          <linearGradient id="lockGradientLarge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#fbbf24", stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#f59e0b", stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="innerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#ffffff", stopOpacity:0.8}} />
            <stop offset="100%" style={{stopColor:"#f8fafc", stopOpacity:0.6}} />
          </linearGradient>
          <filter id="dropShadowLarge" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
          </filter>
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="-1" dy="-1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        {/* Outer Vault Shell */}
        <rect 
          width="64" 
          height="64" 
          rx="16" 
          fill="url(#vaultGradientLarge)" 
          filter="url(#dropShadowLarge)"
        />
        
        {/* Inner Glow Effect */}
        <rect 
          x="2" 
          y="2" 
          width="60" 
          height="60" 
          rx="14" 
          fill="url(#innerGlow)" 
          opacity="0.3"
        />
        
        {/* Main Vault Door */}
        <circle 
          cx="32" 
          cy="32" 
          r="22" 
          fill="#ffffff" 
          opacity="0.95" 
          stroke="url(#vaultGradientLarge)" 
          strokeWidth="2"
          filter="url(#innerShadow)"
        />
        
        {/* Concentric Circles - Vault Mechanism */}
        <circle cx="32" cy="32" r="18" fill="none" stroke="url(#vaultGradientLarge)" strokeWidth="1.5" opacity="0.6"/>
        <circle cx="32" cy="32" r="14" fill="none" stroke="url(#vaultGradientLarge)" strokeWidth="1.2" opacity="0.5"/>
        <circle cx="32" cy="32" r="10" fill="none" stroke="url(#vaultGradientLarge)" strokeWidth="1" opacity="0.4"/>
        
        {/* Central Lock Mechanism */}
        <circle cx="32" cy="32" r="6" fill="url(#lockGradientLarge)" filter="url(#dropShadowLarge)">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 32 32;-360 32 32"
              dur="30s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="32" cy="32" r="4" fill="#ffffff" opacity="0.9"/>
        <circle cx="32" cy="32" r="2.5" fill="url(#lockGradientLarge)">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 32 32;360 32 32"
              dur="15s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="32" cy="32" r="1.5" fill="#ffffff" opacity="0.8"/>
        
        {/* Vault Spokes - Main */}
        <g stroke="url(#vaultGradientLarge)" strokeWidth="2" opacity="0.8" fill="none" strokeLinecap="round">
          <line x1="32" y1="10" x2="32" y2="18" />
          <line x1="32" y1="46" x2="32" y2="54" />
          <line x1="54" y1="32" x2="46" y2="32" />
          <line x1="18" y1="32" x2="10" y2="32" />
        </g>
        
        {/* Vault Spokes - Secondary */}
        <g stroke="url(#vaultGradientLarge)" strokeWidth="1.5" opacity="0.6" fill="none" strokeLinecap="round">
          <line x1="45.25" y1="18.75" x2="41.5" y2="22.5" />
          <line x1="22.5" y1="41.5" x2="18.75" y2="45.25" />
          <line x1="18.75" y1="18.75" x2="22.5" y2="22.5" />
          <line x1="41.5" y1="41.5" x2="45.25" y2="45.25" />
        </g>
        
        {/* Corner Security Indicators */}
        <circle cx="12" cy="12" r="2" fill="url(#lockGradientLarge)" opacity="0.7"/>
        <circle cx="52" cy="12" r="2" fill="url(#lockGradientLarge)" opacity="0.7"/>
        <circle cx="12" cy="52" r="2" fill="url(#lockGradientLarge)" opacity="0.7"/>
        <circle cx="52" cy="52" r="2" fill="url(#lockGradientLarge)" opacity="0.7"/>
        
        {/* Inner Corner Dots */}
        <circle cx="12" cy="12" r="1" fill="#ffffff" opacity="0.9"/>
        <circle cx="52" cy="12" r="1" fill="#ffffff" opacity="0.9"/>
        <circle cx="12" cy="52" r="1" fill="#ffffff" opacity="0.9"/>
        <circle cx="52" cy="52" r="1" fill="#ffffff" opacity="0.9"/>
        
        {/* Vault Handle/Dial Notches */}
        <g stroke="url(#vaultGradientLarge)" strokeWidth="1" opacity="0.5" fill="none">
          <circle cx="32" cy="32" r="7.5" strokeDasharray="2,2">
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 32;360 32 32"
                dur="25s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="32" cy="32" r="12.5" strokeDasharray="3,3">
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 32;-360 32 32"
                dur="35s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="32" cy="32" r="16.5" strokeDasharray="4,4">
            {animated && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 32 32;360 32 32"
                dur="45s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
      </svg>
      
      {showText && (
        <span className="font-bold text-xl gradient-text">
          LifeVault
        </span>
      )}
    </div>
  );
};

export default Logo;
