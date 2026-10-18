import type {
  HomePageSection,
  StorefrontSliderConfig,
} from "@/shared/types";

export function isHeroSliderSection(section: HomePageSection): boolean {
  const normalizedType = (value: string | undefined) =>
    value?.trim().toLowerCase().replace(/[-_]/g, "");
  const normalizedTitle = section.title?.trim().toLowerCase();
  const displayMode = (
    section.config?.displayType ||
    section.config?.viewType ||
    section.config?.displayMode ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();

  return (
    normalizedType(section.type) === "heroslider" ||
    normalizedType(section.key) === "heroslider" ||
    section.id?.trim().toLowerCase() === "sec-hero-slider" ||
    section.id?.trim().toLowerCase() === "sec-hero-default" ||
    ((normalizedType(section.type) === "banner" ||
      normalizedType(section.type) === "banners" ||
      normalizedType(section.key) === "banner" ||
      normalizedType(section.key) === "banners") &&
      (normalizedTitle?.includes("hero") === true ||
        normalizedTitle?.includes("slider") === true ||
        displayMode === "slider" ||
        displayMode === "carousel" ||
        section.config?.isCarousel === true))
  );
}

export function createStandaloneHeroSection(
  sliders: unknown[],
  sliderConfig?: StorefrontSliderConfig | null,
): HomePageSection {
  const configuredSlides = sliderConfig?.items;
  const slides =
    configuredSlides && configuredSlides.length > 0
      ? configuredSlides
      : sliders;

  return {
    id: "store-layout-hero-slider",
    type: "heroSlider",
    isActive: true,
    data: slides,
    config: { ...sliderConfig, items: slides },
  };
}
