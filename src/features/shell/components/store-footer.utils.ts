import type {
  StorefrontFooterColumnConfig,
  StorefrontFooterLinkConfig,
} from "@/shared/types";
import { DEFAULT_FOOTER_COLUMNS } from "./store-footer.constants";

export function resolveFooterColumns(
  configuredColumns?: StorefrontFooterColumnConfig[],
): Array<
  StorefrontFooterColumnConfig & { links: StorefrontFooterLinkConfig[] }
> {
  const sourceColumns =
    configuredColumns && configuredColumns.length > 0
      ? configuredColumns
      : DEFAULT_FOOTER_COLUMNS;

  return sourceColumns.map((column) => ({
    ...column,
    links:
      column.items?.map((item) => ({
        title: item.label,
        url: item.link,
      })) ??
      column.links ??
      [],
  }));
}

