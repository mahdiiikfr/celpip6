import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppHeaderProps {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
  title?: string;
}

// Component for the application header
export default function AppHeader({ leftAction, rightAction, className = '', title }: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative z-50 ${className}`} dir="ltr">
      {/* Top Orange Bar - Reduced height to approx 30px (h-7/h-8) to match status bar look */}
      <div className="bg-amber-500 h-8 w-full absolute top-0 left-0 right-0"></div>

      {/* The Central Protrusion (Tab) using SVG */}
      <div className="absolute top-8 left-0 right-0 w-full flex justify-center pointer-events-none overflow-hidden">
        <svg
          width="100%"
          height="40"
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          className="w-full h-10 text-amber-500 fill-current -mt-[1px]"
        >
          {/*
             Refined Curve based on user request:
             - Wider spread
             - Shallower depth
             - Smooth ease-in/out
             M0,0: Start at top-left of SVG (which is bottom of orange bar)
             C 120,0 160,32 200,32: Curve down to center (200,32). Control points (120,0) and (160,32) create the ease.
             S 280,0 400,0: Symmetric reflection to the right.
          */}
          <path d="M0,0 C 120,0 160,32 200,32 S 280,0 400,0 Z" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full">
         {/*
            Title Container
            Positioned absolutely to center it within the curve.
            Top offset adjusted to sit inside the orange dip.
            (Top 8 + curve depth ~30 -> center around 20px from top)
         */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-8">
           <span className="text-white font-bold text-sm drop-shadow-md whitespace-nowrap -mt-1">
             {title || t('common.zabanFly')}
           </span>
        </div>

        {/*
           Action Buttons Container
           Rendered below the header content visually, but structurally here.
           Using 'h-0' to not push content down unnecessarily, but allowing overflow for buttons.
        */}
        <div className="flex justify-between items-start px-4 pt-14">
            {/* Left Action (Back Button) */}
            <div className="w-12 h-12 flex items-center justify-center pointer-events-auto">
               {leftAction}
            </div>

            {/* Right Action */}
            <div className="w-12 h-12 flex items-center justify-center pointer-events-auto">
               {rightAction}
            </div>
        </div>
      </div>
    </div>
  );
}
