import React from "react";

export const RockIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="neon-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path 
        d="M30 60 L25 45 L35 30 L65 30 L75 45 L70 60 L50 75 Z" 
        stroke="#00f3ff" 
        strokeWidth="3" 
        fill="rgba(0, 243, 255, 0.1)" 
        filter="url(#neon-blue)"
        strokeLinejoin="round"
    />
    <path 
        d="M35 30 L50 45 M65 30 L50 45 M25 45 L50 45 L75 45 M50 75 L50 45" 
        stroke="#00f3ff" 
        strokeWidth="1" 
        opacity="0.5"
    />
  </svg>
);

export const PaperIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
     <defs>
      <filter id="neon-cyan" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect 
        x="30" y="20" width="40" height="60" rx="4"
        stroke="#bc13fe" 
        strokeWidth="3" 
        fill="rgba(188, 19, 254, 0.1)" 
        filter="url(#neon-cyan)"
    />
    <line x1="40" y1="35" x2="60" y2="35" stroke="#bc13fe" strokeWidth="2" opacity="0.6" />
    <line x1="40" y1="50" x2="60" y2="50" stroke="#bc13fe" strokeWidth="2" opacity="0.6" />
    <line x1="40" y1="65" x2="60" y2="65" stroke="#bc13fe" strokeWidth="2" opacity="0.6" />
  </svg>
);

export const ScissorIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="neon-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path 
        d="M35 70 L65 30 M65 70 L35 30" 
        stroke="#0aff68" 
        strokeWidth="4" 
        strokeLinecap="round"
        filter="url(#neon-green)"
    />
    <circle cx="35" cy="75" r="5" stroke="#0aff68" strokeWidth="2" fill="none" />
    <circle cx="65" cy="75" r="5" stroke="#0aff68" strokeWidth="2" fill="none" />
  </svg>
);
