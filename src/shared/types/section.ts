export type SectionType =
  | "heroSlider"
  | "banners"
  | "category"
  | "videos"
  | "products"
  | "brands"
  | "customer_reviews"
  | string;

export interface SectionStyles {
  layout?: "full-width" | "boxed" | "fluid" | "standard" | "cropped";
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  mobilePaddingTop?: number | string;
  mobilePaddingRight?: number | string;
  mobilePaddingBottom?: number | string;
  mobilePaddingLeft?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  mobileMarginTop?: number | string;
  mobileMarginBottom?: number | string;
  mobileMarginLeft?: number | string;
  mobileMarginRight?: number | string;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundType?: "color" | "gradient";
  backgroundImage?: string;
  titleFontSize?: number | string;
  titleFontWeight?: number | string;
  titleFontStyle?: "normal" | "italic";
  titleLetterSpacing?: number | string;
  titleColor?: string;
  titleAlignment?: "left" | "center" | "right";
  titleAlign?: "left" | "center" | "right";
  titleLineHeight?: number;
  subtitleFontSize?: number | string;
  subtitleFontWeight?: number | string;
  subtitleFontStyle?: "normal" | "italic";
  subtitleLetterSpacing?: number | string;
  subtitleLineHeight?: number;
  subtitleColor?: string;
  subtitleAlignment?: "left" | "center" | "right";
  borderRadius?: number | string;
  borderRadiusTopLeft?: number;
  borderRadiusTopRight?: number;
  borderRadiusBottomRight?: number;
  borderRadiusBottomLeft?: number;
  borderColor?: string;
  borderStyle?: string;
  borderWidthTop?: number;
  borderWidthRight?: number;
  borderWidthBottom?: number;
  borderWidthLeft?: number;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  boxShadow?: string;
  cardGap?: number | string;
  columns?: number;
  mobileColumns?: number;
  categoryColumns?: number;
  productColumns?: number;
  brandColumns?: number;
}

export interface BannerSlideItem {
  id?: string;
  _id?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  headline?: string;
  subtitle?: string;
  subHeadline?: string;
  linkUrl?: string;
  redirectUrl?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  altText?: string;
  order?: number;
  sortOrder?: number;
}

export interface VideoItem {
  _id?: string;
  id?: string;
  url?: string;
  videoUrl?: string;
  videoId?: string;
  caption?: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface ReviewItem {
  _id?: string;
  id?: string;
  name?: string;
  reviewerName?: string;
  profession?: string;
  rating: number;
  text?: string;
  comment?: string;
  picture?: string;
  avatarUrl?: string;
  date?: string;
}

export interface BrandItem {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  logo?: string | null;
  imageUrl?: string | null;
}

export interface HomePageSection {
  id?: string;
  type?: SectionType;
  key?: string;
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  order?: number;
  sortOrder?: number;
  config?: Record<string, unknown>;
  styles?: SectionStyles;
  data?: unknown;
}

