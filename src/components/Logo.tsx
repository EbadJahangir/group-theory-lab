import React from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showWordmark = true, subtitle }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="8"
          className="fill-[#526B58] dark:fill-[#6F9278]"
        />
        {/* Regular hexagon representing dihedral symmetry */}
        <polygon
          points="18,6.5 28,12.25 28,23.75 18,29.5 8,23.75 8,12.25"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          fill="none"
        />
        {/* Three primary symmetry axes */}
        <line x1="18" y1="6.5" x2="18" y2="29.5" stroke="#C8D3BD" strokeWidth="1.15" />
        <line x1="8" y1="12.25" x2="28" y2="23.75" stroke="#C8D3BD" strokeWidth="1.15" />
        <line x1="28" y1="12.25" x2="8" y2="23.75" stroke="#C8D3BD" strokeWidth="1.15" />
        <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
      </svg>
      {showWordmark && (
        <div className="min-w-0">
          <div className="font-display text-[17px] font-bold tracking-tight text-[#373B35] dark:text-[#ECEEE9] whitespace-nowrap leading-tight">
            GroupTheory Lab
          </div>
          {subtitle && (
            <div className="text-[11px] leading-tight text-[#656B61] dark:text-[#A2ACA0]">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
