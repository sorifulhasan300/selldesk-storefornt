import React from "react";

interface HeroSliderPlaceholderProps {
  borderRadius?: string;
}

export function HeroSliderPlaceholder({
  borderRadius = "0px",
}: HeroSliderPlaceholderProps) {
  return (
    <div
      className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden select-none flex flex-col items-center justify-center gap-4 bg-slate-100 border-2 border-dashed border-slate-300"
      style={{ borderRadius }}
      role="region"
      aria-label="Hero slider placeholder"
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-200 text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-10 h-10"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m10 9 5 3-5 3V9Z" />
          <path d="M2 8h20" />
        </svg>
      </div>

      <div className="text-center px-6 max-w-xs">
        <p className="text-base font-semibold text-slate-600">Hero Slider</p>
        <p className="text-sm text-slate-400 mt-1">
          Add your banner slides in the builder to display your promotions here.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`block rounded-full ${
              i === 0 ? "w-4 h-2 bg-slate-400" : "w-2 h-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

