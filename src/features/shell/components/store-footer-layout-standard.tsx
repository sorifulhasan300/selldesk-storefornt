import type { CSSProperties, ReactNode } from "react";
import type {
  StoreConfig,
  StorefrontFooterConfig,
} from "@/shared/types";
import { StoreLogo } from "./store-footer-logo";
import { SocialLinks, type SocialNetwork } from "./store-footer-social";
import { ContactDetails } from "./store-footer-contact";

export interface FooterLayoutStandardProps {
  layout: number;
  store: StoreConfig;
  effectiveFooter?: StorefrontFooterConfig;
  about: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  availableSocialLinks: Partial<Record<SocialNetwork, string>>;
  contentStyle: CSSProperties;
  columnsContent: ReactNode;
}

export function FooterLayoutStandard({
  layout,
  store,
  effectiveFooter,
  about,
  contactPhone,
  contactEmail,
  contactAddress,
  availableSocialLinks,
  contentStyle,
  columnsContent,
}: FooterLayoutStandardProps) {
  const hasContact = Boolean(contactPhone || contactEmail || contactAddress);

  if (layout === 1) {
    return (
      <div
        className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:px-8"
        style={contentStyle}
      >
        <div className="space-y-4">
          <StoreLogo store={store} configuredLogo={effectiveFooter?.logo} />
          <p className="max-w-sm opacity-80">{about}</p>
          {hasContact && (
            <ContactDetails
              phone={contactPhone}
              email={contactEmail}
              address={contactAddress}
            />
          )}
          <SocialLinks
            links={availableSocialLinks}
            style={effectiveFooter?.socialIconStyle}
          />
        </div>
        {columnsContent}
      </div>
    );
  }

  return (
    <div
      className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:px-8"
      style={contentStyle}
    >
      <div className="space-y-4">
        <StoreLogo store={store} configuredLogo={effectiveFooter?.logo} />
        <p className="max-w-sm opacity-80">{about}</p>
      </div>
      {columnsContent}
      <div className="space-y-5">
        <SocialLinks
          links={availableSocialLinks}
          style={effectiveFooter?.socialIconStyle}
        />
        {hasContact && (
          <ContactDetails
            phone={contactPhone}
            email={contactEmail}
            address={contactAddress}
          />
        )}
      </div>
    </div>
  );
}

