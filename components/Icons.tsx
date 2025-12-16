import React from 'react';

export const BasketIcon: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
    {/* Eggs */}
    <ellipse cx="30" cy="40" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    <ellipse cx="70" cy="40" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    <ellipse cx="50" cy="30" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    <ellipse cx="20" cy="55" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    <ellipse cx="80" cy="55" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    <ellipse cx="50" cy="50" rx="15" ry="20" fill="#a1a1aa" stroke="black" strokeWidth="3" />
    
    {/* Basket */}
    <path 
      d="M10,60 L90,60 L80,90 L20,90 Z" 
      fill="#64748b" 
      stroke="black" 
      strokeWidth="4" 
    />
    <rect x="5" y="55" width="90" height="10" rx="5" fill="#94a3b8" stroke="black" strokeWidth="4" />
  </svg>
);

interface EggmanProps {
  isChewing: boolean;
  orientation: 'front' | 'turning1' | 'turning2' | 'back';
}

export const EggmanIcon: React.FC<EggmanProps> = ({ isChewing, orientation }) => {
  return (
    <svg viewBox="0 0 120 160" className="w-full h-full overflow-visible">
      {/* Legs */}
      <path d="M40,120 L40,140 L20,140" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80,120 L80,140 L100,140" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Body */}
      <ellipse cx="60" cy="70" rx="45" ry="55" fill="#bae6fd" stroke="black" strokeWidth="4" />

      {/* Face Logic based on orientation */}
      {orientation === 'front' && (
        <>
          {/* Eyes */}
          <circle cx="45" cy="50" r="5" fill="none" stroke="black" strokeWidth="2" />
          <circle cx="45" cy="50" r="2" fill="black" /> {/* Pupil */}
          
          <circle cx="75" cy="50" r="5" fill="none" stroke="black" strokeWidth="2" />
          <circle cx="75" cy="50" r="2" fill="black" /> {/* Pupil */}
          
          {/* Mouth */}
          {isChewing ? (
            // Chewing / Eating mouth (Closed to eat)
            <path d="M50,80 L70,80" stroke="black" strokeWidth="3" strokeLinecap="round" />
          ) : (
            // Idle mouth (Open waiting for egg)
            <circle cx="60" cy="80" r="15" fill="black" />
          )}
          
          {/* Hand (Static as per ref image) */}
          <path d="M90,90 Q100,80 105,90" fill="none" stroke="black" strokeWidth="2" />
          <path d="M105,90 L100,100" fill="none" stroke="black" strokeWidth="2" />
        </>
      )}

      {orientation === 'turning1' && (
         // Slightly turned
         <>
          <circle cx="70" cy="50" r="4" fill="none" stroke="black" strokeWidth="2" />
         </>
      )}

      {orientation === 'turning2' && (
         // Mostly back
         <>
         </>
      )}

      {orientation === 'back' && (
        <>
          {/* The Butt: 2 cheeks and a hole */}
          {/* Left Cheek Arc */}
          <path d="M60,105 Q45,115 35,90" fill="none" stroke="black" strokeWidth="2" />
          {/* Right Cheek Arc */}
          <path d="M60,105 Q75,115 85,90" fill="none" stroke="black" strokeWidth="2" />
          {/* The Hole */}
          <circle cx="60" cy="105" r="3" fill="black" />
        </>
      )}
    </svg>
  );
};