"use client";

import { HeroSliderBlock } from "../sections/HeroSliderBlock";
import { createStandaloneHeroSection } from "../utils/home-section.utils";
import type { StorefrontSliderConfig } from "@/shared/types";

interface StorefrontHeroSliderProps {
  sliders: unknown[];
  sliderConfig?: StorefrontSliderConfig | null;
  currency?: string;
  isPreview?: boolean;
}

export function StorefrontHeroSlider({
  sliders,
  sliderConfig,
  currency,
  isPreview = false,
}: StorefrontHeroSliderProps) {
  const section = createStandaloneHeroSection(sliders, sliderConfig);
  const hasSlides =
    sliders.length > 0 || (sliderConfig?.items?.length ?? 0) > 0;

  if (sliderConfig?.active === false || !hasSlides) return null;

  const isFullWidth = Number(section.config?.layout) === 2;

  return (
    <div
      className={
        isFullWidth
          ? "relative left-1/2 w-screen -translate-x-1/2"
          : "w-full"
      }
    >
      <HeroSliderBlock
        section={section}
        currency={currency}
        isPreview={isPreview}
        fallbackSliders={sliders}
      />
    </div>
  );
}
