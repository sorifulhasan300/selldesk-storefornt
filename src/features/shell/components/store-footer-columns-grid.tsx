import type {
  StorefrontFooterColumnConfig,
  StorefrontFooterLinkConfig,
} from "@/shared/types";
import { FooterColumn } from "./store-footer-column";

export interface FooterColumnsGridProps {
  columns: Array<
    StorefrontFooterColumnConfig & { links: StorefrontFooterLinkConfig[] }
  >;
  collapsibleOnMobile: boolean;
  headingColor: string;
  headingFontSize: number;
  textColor: string;
  fontSize: number;
}

export function FooterColumnsGrid({
  columns,
  collapsibleOnMobile,
  headingColor,
  headingFontSize,
  textColor,
  fontSize,
}: FooterColumnsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-8 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
      {columns.map((column, index) => (
        <FooterColumn
          key={`${column.title}-${index}`}
          column={column}
          collapsibleOnMobile={collapsibleOnMobile}
          headingColor={headingColor}
          headingFontSize={headingFontSize}
          textColor={textColor}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}

