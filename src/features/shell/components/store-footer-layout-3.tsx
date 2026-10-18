import Link from "next/link";
import type { CSSProperties } from "react";
import type {
  StoreConfig,
  StorefrontFooterColumnConfig,
  StorefrontFooterConfig,
  StorefrontFooterLinkConfig,
} from "@/shared/types";
import { StoreLogo } from "./store-footer-logo";
import { SocialLinks, type SocialNetwork } from "./store-footer-social";

export interface FooterLayout3Props {
  store: StoreConfig;
  effectiveFooter?: StorefrontFooterConfig;
  about: string;
  columns: Array<
    StorefrontFooterColumnConfig & { links: StorefrontFooterLinkConfig[] }
  >;
  availableSocialLinks: Partial<Record<SocialNetwork, string>>;
  contentStyle: CSSProperties;
}

export function FooterLayout3({
  store,
  effectiveFooter,
  about,
  columns,
  availableSocialLinks,
  contentStyle,
}: FooterLayout3Props) {
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8"
      style={contentStyle}
    >
      <StoreLogo store={store} configuredLogo={effectiveFooter?.logo} centered />
      <p className="max-w-2xl opacity-80">{about}</p>
      <nav aria-label="Footer navigation" className="w-full">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {columns.flatMap((column, columnIndex) =>
            column.links.map((link, linkIndex) => (
              <li key={`${columnIndex}-${link.url}-${linkIndex}`}>
                <Link
                  href={link.url}
                  className="transition-opacity hover:opacity-70"
                >
                  {link.title}
                </Link>
              </li>
            )),
          )}
        </ul>
      </nav>
      <SocialLinks
        links={availableSocialLinks}
        style={effectiveFooter?.socialIconStyle}
      />
    </div>
  );
}

