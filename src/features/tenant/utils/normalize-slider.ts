import {
  StoreSlider,
  StorefrontSliderConfig,
  StorefrontSliderItemConfig,
} from "@/shared/types";

export function resolveSliderItemImage(
  item: StorefrontSliderItemConfig,
): string {
  if (typeof item.image === "string" && item.image.trim()) {
    return item.image.trim();
  }
  const imgObj =
    typeof item.image === "object" && item.image !== null
      ? item.image
      : undefined;

  return (
    imgObj?.thumbs?.large ||
    imgObj?.thumbs?.url ||
    imgObj?.url ||
    item.imageUrl ||
    item.url ||
    ""
  );
}

export function resolveSliderItemLink(
  item: StorefrontSliderItemConfig,
): string {
  return (
    item.link ||
    item.linkUrl ||
    item.redirectUrl ||
    "/products"
  );
}

export function normalizeSliderItems(items: unknown[]): StoreSlider[] {
  return items
    .filter((item): item is StorefrontSliderItemConfig => {
      if (!item || typeof item !== "object") return false;
      const rec = item as StorefrontSliderItemConfig;
      return rec.active !== false;
    })
    .map((item, idx) => ({
      id: item.id || item._id || `s-${idx + 1}`,
      title: item.title || "",
      subtitle: item.subtitle || null,
      imageUrl: resolveSliderItemImage(item),
      linkUrl: resolveSliderItemLink(item),
      order: item.order ?? item.sortOrder ?? idx,
    }))
    .filter((s) => Boolean(s.imageUrl));
}

export function normalizeBootstrapSliders(
  sliderConfig: StorefrontSliderConfig | undefined,
  rawSliders: unknown,
  bannerSectionData: unknown,
): { sliders: StoreSlider[]; isSliderActive: boolean } {
  const isSliderActive = sliderConfig?.active !== false;

  // 1. Prioritize unified config.slider if it exists and has items
  if (
    sliderConfig &&
    Array.isArray(sliderConfig.items) &&
    sliderConfig.items.length > 0
  ) {
    const mapped = normalizeSliderItems(sliderConfig.items);
    return {
      sliders: mapped,
      isSliderActive,
    };
  }

  // If unified sliderConfig is defined, retire legacy CMS sliders fallback
  if (sliderConfig) {
    return {
      sliders: [],
      isSliderActive,
    };
  }

  // 2. Fallback to legacy CMS sliders list only if sliderConfig is completely absent
  if (Array.isArray(rawSliders) && rawSliders.length > 0) {
    return {
      sliders: rawSliders as StoreSlider[],
      isSliderActive,
    };
  }

  // 3. Fallback to legacy banner section data
  if (Array.isArray(bannerSectionData) && bannerSectionData.length > 0) {
    const mapped = (bannerSectionData as Record<string, unknown>[]).map(
      (item, idx) => ({
        id: (item.id || item._id || `s-${item.sortOrder || idx + 1}`) as string,
        title: (item.title || "") as string,
        subtitle: (item.subtitle || null) as string | null,
        imageUrl: (item.imageUrl || item.url || "") as string,
        linkUrl: (item.redirectUrl ||
          item.linkUrl ||
          item.link ||
          "/products") as string,
        order: (item.sortOrder ?? item.order ?? idx) as number,
      }),
    );
    return {
      sliders: mapped,
      isSliderActive,
    };
  }

  return {
    sliders: [],
    isSliderActive,
  };
}

