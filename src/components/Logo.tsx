import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export function Logo({ className = '', variant = 'full' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        {/* Monitor Frame */}
        <svg 
          width={variant === 'full' ? "80" : "40"} 
          height={variant === 'full' ? "64" : "32"} 
          viewBox="0 0 100 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          
          {/* Main Monitor Body */}
          <rect 
            x="5" 
            y="5" 
            width="90" 
            height="55" 
            rx="6" 
            stroke="url(#logoGradient)" 
            strokeWidth="3.5" 
          />
          
          {/* Monitor Stand */}
          <path 
            d="M40 60 L60 60 L70 75 L30 75 Z" 
            stroke="url(#logoGradient)" 
            strokeWidth="3" 
            strokeLinejoin="round"
          />
          
          {/* Diamond Inside */}
          <path 
            d="M38 20 L62 20 L72 32 L50 48 L28 32 Z" 
            stroke="url(#logoGradient)" 
            strokeWidth="2.5" 
            fill="none"
          />
          <path 
            d="M28 32 L50 32 L72 32 M38 20 L50 32 L62 20 M50 20 L50 32 L50 48 M28 32 L50 48 L72 32 M38 20 L50 48 L62 20" 
            stroke="url(#logoGradient)" 
            strokeWidth="1.5" 
            strokeOpacity="0.8"
          />
          <path 
            d="M38 20 L62 20 L72 32 L50 48 L28 32 Z" 
            fill="url(#logoGradient)" 
            fillOpacity="0.1" 
          />
        </svg>
      </motion.div>

      {variant === 'full' && (
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans">
            GeoMDS
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground font-semibold mt-1.5 uppercase">
            Document Management System
          </p>
        </div>
      )}
    </div>
  );
}
