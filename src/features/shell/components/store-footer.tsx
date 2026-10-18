"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  ChevronDown,
  MessagesSquare,
  Send,
  X,
  type LucideIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type {
  StoreConfig,
  StorefrontFooterColumnConfig,
  StorefrontFooterConfig,
  StorefrontFooterLinkConfig,
} from "@/shared/types";

export interface StoreFooterContactConfig {
  phone?: string;
  email?: string;
  address?: string;
}

export interface StoreFooterProps {
  store: StoreConfig;
  footer?: StorefrontFooterConfig;
  config?: {
    footer?: StorefrontFooterConfig;
    contact?: StoreFooterContactConfig;
    socialLinks?: Record<string, string>;
  };
}

interface FooterColumnProps {
  column: StorefrontFooterColumnConfig & {
    links: StorefrontFooterLinkConfig[];
  };
  collapsibleOnMobile: boolean;
  headingColor: string;
  headingFontSize: number;
  textColor: string;
  fontSize: number;
}

const DEFAULT_COLUMNS: StorefrontFooterColumnConfig[] = [
  {
    title: "Navigation",
    links: [
      { title: "Home", url: "/" },
      { title: "Catalog", url: "/products" },
      { title: "Shopping Cart", url: "/cart" },
      { title: "Checkout", url: "/checkout" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { title: "Privacy Policy", url: "/pages/privacy" },
      { title: "Terms of Service", url: "/pages/terms" },
      { title: "Return & Refund", url: "/pages/return" },
      { title: "Contact Support", url: "/contact" },
    ],
  },
];

const SOCIAL_NETWORKS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "whatsapp",
  "messenger",
  "x",
  "linkedin",
  "telegram",
] as const;

type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  x: "X",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};

const SOCIAL_COLORS: Record<SocialNetwork, string> = {
  facebook: "#1877f2",
  instagram: "#e4405f",
  youtube: "#ff0000",
  tiktok: "#111111",
  whatsapp: "#25d366",
  messenger: "#0866ff",
  x: "#000000",
  linkedin: "#0a66c2",
  telegram: "#26a5e4",
};

const ADDITIONAL_SOCIAL_ICONS: Partial<Record<SocialNetwork, LucideIcon>> = {
  messenger: MessagesSquare,
  x: X,
  telegram: Send,
};

function SocialIcon({ network, size }: { network: SocialNetwork; size: number }) {
  const iconSize = Math.max(14, Math.round(size * 0.5));

  if (network === "facebook") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
      </svg>
    );
  }

  if (network === "instagram") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (network === "youtube") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 7.2a6.7 6.7 0 0 1-4.1-1.4v8.1a6 6 0 1 1-5.2-5.9v3.3a2.7 2.7 0 1 0 1.9 2.6V2.5h3.3c.2 2 1.4 3.8 3.3 4.5.3.1.6.2.9.2v3.3c-.1 0-.1 0-.1 0Z" />
      </svg>
    );
  }

  if (network === "whatsapp") {
    return (
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4Z" />
        <path d="M8.6 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1-.6 1.3-.4.4-1 .6-1.6.5-1-.1-2.5-.8-3.9-2.1-1.2-1.1-2-2.5-2.2-3.4-.2-.8.2-1.5.5-1.9Z" />
      </svg>
    );
  }

  const Icon = ADDITIONAL_SOCIAL_ICONS[network];
  if (Icon) {
    return <Icon aria-hidden="true" width={iconSize} height={iconSize} />;
  }

  return (
    <span aria-hidden="true" className="text-xs font-bold leading-none">
      in
    </span>
  );
}

function FooterColumn({
  column,
  collapsibleOnMobile,
  headingColor,
  headingFontSize,
  textColor,
  fontSize,
}: FooterColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const headingStyle = {
    color: headingColor,
    fontSize: `${headingFontSize}px`,
  };

  return (
    <section>
      {collapsibleOnMobile ? (
        <>
          <h4
            className="mb-4 hidden font-bold uppercase tracking-wider md:block"
            style={headingStyle}
          >
            {column.title}
          </h4>
          <button
            type="button"
            className="flex w-full items-center justify-between border-b border-current/15 py-3 text-left font-bold uppercase tracking-wider md:hidden"
            style={headingStyle}
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={() => setIsOpen((open) => !open)}
          >
            {column.title}
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            id={contentId}
            className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out md:grid-rows-[1fr] ${
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <ul
              className="min-h-0 space-y-2.5 overflow-hidden pb-4 md:pb-0"
              style={{ color: textColor, fontSize: `${fontSize}px` }}
            >
              {column.links.map((link, index) => (
                <li key={`${link.url}-${index}`}>
                  <Link
                    href={link.url}
                    className="transition-opacity hover:opacity-70"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h4
            className="mb-4 font-bold uppercase tracking-wider"
            style={headingStyle}
          >
            {column.title}
          </h4>
          <ul
            className="space-y-2.5"
            style={{ color: textColor, fontSize: `${fontSize}px` }}
          >
            {column.links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <Link
                  href={link.url}
                  className="transition-opacity hover:opacity-70"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function StoreLogo({
  store,
  configuredLogo,
  centered = false,
}: {
  store: StoreConfig;
  configuredLogo: StorefrontFooterConfig["logo"];
  centered?: boolean;
}) {
  const logoObject =
    configuredLogo && typeof configuredLogo === "object"
      ? configuredLogo
      : undefined;
  const logoSrc =
    (typeof configuredLogo === "string" ? configuredLogo : undefined) ||
    logoObject?.thumbs?.large ||
    logoObject?.thumbs?.url ||
    logoObject?.thumbs?.medium ||
    store.logoUrl;

  return (
    <Link
      href="/"
      className={`inline-flex min-h-10 items-center ${
        centered ? "justify-center" : ""
      }`}
      aria-label={`${store.name} home`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={store.name}
          width={180}
          height={64}
          className="h-auto max-h-16 w-auto max-w-48 object-contain"
          unoptimized
        />
      ) : (
        <span className="text-lg font-bold">{store.name}</span>
      )}
    </Link>
  );
}

function SocialLinks({
  links,
  style,
}: {
  links: Partial<Record<SocialNetwork, string>>;
  style: StorefrontFooterConfig["socialIconStyle"];
}) {
  const size = style?.size ?? 36;
  const gap = style?.gap ?? 8;
  const shape = style?.shape ?? "circle";
  const iconOnly = shape === "icon";
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
        ? "rounded-md"
        : "rounded-none";
  const isCustomColor = style?.mode === "custom";

  return (
    <div className="flex flex-wrap items-center" style={{ gap: `${gap}px` }}>
      {SOCIAL_NETWORKS.map((network) => {
          const href = links[network];
          if (!href) return null;

          const color = SOCIAL_COLORS[network];
          return (
            <a
              key={network}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_LABELS[network]}
              className={`inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-75 ${
                iconOnly ? "" : shapeClass
              }`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: iconOnly
                  ? "transparent"
                  : isCustomColor
                    ? style?.color ?? "currentColor"
                    : color,
                color: isCustomColor
                  ? iconOnly
                    ? style?.color ?? "currentColor"
                    : "white"
                  : iconOnly
                    ? "currentColor"
                    : "white",
              }}
            >
              <SocialIcon network={network} size={size} />
            </a>
          );
        })}
    </div>
  );
}

function ContactDetails({
  phone,
  email,
  address,
}: StoreFooterContactConfig) {
  const details: { icon: ReactNode; value?: string }[] = [
    { icon: <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />, value: phone },
    { icon: <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />, value: email },
    { icon: <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />, value: address },
  ];

  return (
    <address className="space-y-2 pt-2 not-italic">
      {details.map(
        ({ icon, value }, index) =>
          value && (
            <div key={`${value}-${index}`} className="flex items-center gap-2">
              {icon}
              <span>{value}</span>
            </div>
          ),
      )}
    </address>
  );
}

function PaymentBadges({ icons }: { icons: string[] }) {
  const names: Record<string, string> = {
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    upay: "upay",
    visa: "VISA",
    mastercard: "Mastercard",
    "master-card": "Mastercard",
    master_card: "Mastercard",
    amex: "AMEX",
    cod: "Cash on Delivery",
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {icons.map((icon, index) => {
        const key = icon.trim().toLowerCase();
        const label = names[key] ?? icon.trim();
        return label ? (
          <span
            key={`${key}-${index}`}
            className="rounded border border-current/20 bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-slate-700"
          >
            {label}
          </span>
        ) : null;
      })}
    </div>
  );
}

function ValuePropositions() {
  const benefits = [
    {
      title: "Reliable Delivery",
      description: "Fast doorstep shipping across zones",
      icon: <Truck className="h-6 w-6" />,
      className: "bg-[var(--store-primary)]/10 text-[var(--store-primary)]",
    },
    {
      title: "100% Authentic",
      description: "Verified quality guaranteed",
      icon: <ShieldCheck className="h-6 w-6" />,
      className: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free 7-day replacement",
      icon: <RefreshCcw className="h-6 w-6" />,
      className: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="border-b border-current/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 text-center md:grid-cols-3 md:px-6 lg:px-8 md:text-left">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center justify-center gap-4 md:justify-start"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${benefit.className}`}
            >
              {benefit.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold">{benefit.title}</h4>
              <p className="text-xs opacity-70">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoreFooter({ store, footer, config }: StoreFooterProps) {
  const effectiveFooter = config?.footer ?? footer;
  const configuredColumns = effectiveFooter?.columns;
  const sourceColumns =
    configuredColumns && configuredColumns.length > 0
      ? configuredColumns
      : DEFAULT_COLUMNS;
  const columns: Array<
    StorefrontFooterColumnConfig & { links: StorefrontFooterLinkConfig[] }
  > = sourceColumns.map((column) => ({
    ...column,
    links:
      column.items?.map((item) => ({
        title: item.label,
        url: item.link,
      })) ??
      column.links ??
      [],
  }));
  const layout = effectiveFooter?.layout === 2 || effectiveFooter?.layout === 3
    ? effectiveFooter.layout
    : 1;

  const contactPhone = config?.contact?.phone ?? store.contactPhone ?? undefined;
  const contactEmail = config?.contact?.email ?? store.contactEmail ?? undefined;
  const contactAddress = config?.contact?.address;
  const about =
    effectiveFooter?.about ||
    store.description ||
    "Your one-stop destination for quality products with exceptional customer service.";
  const socialLinks = {
    ...config?.socialLinks,
    ...effectiveFooter?.socialLinks,
  };
  const availableSocialLinks: Partial<Record<SocialNetwork, string>> = {
    facebook: socialLinks.facebook || store.facebookUrl || undefined,
    instagram: socialLinks.instagram || store.instagramUrl || undefined,
    youtube: socialLinks.youtube || undefined,
    tiktok: socialLinks.tiktok || undefined,
    whatsapp: socialLinks.whatsapp || undefined,
    messenger: socialLinks.messenger || undefined,
    x: socialLinks.x || undefined,
    linkedin: socialLinks.linkedin || undefined,
    telegram: socialLinks.telegram || undefined,
  };
  const style = effectiveFooter?.style;
  const backgroundColor = style?.bgColor ?? "#ffffff";
  const textColor = style?.textColor ?? "#475569";
  const headingColor = style?.headingColor ?? "#0f172a";
  const fontSize = style?.fontSize ?? 14;
  const headingFontSize = style?.headingFontSize ?? 14;
  const footerStyle: CSSProperties = {
    backgroundColor,
    backgroundImage:
      style?.backgroundMode === "gradient"
        ? `linear-gradient(to right, ${style.gradientStartColor ?? backgroundColor}, ${style.gradientEndColor ?? backgroundColor})`
        : undefined,
    color: textColor,
    borderTop: `${style?.borderTopSize ?? 1}px solid ${style?.borderTopColor ?? "#e2e8f0"}`,
    fontSize: `${fontSize}px`,
    marginTop: "5rem",
  };
  const contentStyle: CSSProperties = {
    paddingTop: `${style?.paddingTop ?? 40}px`,
    paddingBottom: `${style?.paddingBottom ?? 24}px`,
  };
  const bottomCopyright =
    effectiveFooter?.bottomBar?.copyright ||
    effectiveFooter?.copyright ||
    `© ${new Date().getFullYear()} ${store.name}`;
  const showBottomBar = effectiveFooter?.bottomBar?.enabled !== false;
  const showDeveloperCredit =
    effectiveFooter?.bottomBar?.showDeveloperCredit === true;
  const paymentIcons = effectiveFooter?.bottomBar?.paymentIcons ?? [];

  const renderColumns = (
    items: Array<
      StorefrontFooterColumnConfig & { links: StorefrontFooterLinkConfig[] }
    >,
  ) => (
    <div
      className="grid grid-cols-1 gap-x-8 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]"
    >
      {items.map((column, index) => (
        <FooterColumn
          key={`${column.title}-${index}`}
          column={column}
          collapsibleOnMobile={effectiveFooter?.collapsibleOnMobile === true}
          headingColor={headingColor}
          headingFontSize={headingFontSize}
          textColor={textColor}
          fontSize={fontSize}
        />
      ))}
    </div>
  );

  return (
    <footer className="mt-20 border-t" style={footerStyle}>
      {layout !== 3 && <ValuePropositions />}

      {layout === 1 && (
        <div
          className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:px-8"
          style={contentStyle}
        >
          <div className="space-y-4">
            <StoreLogo store={store} configuredLogo={effectiveFooter?.logo} />
            <p className="max-w-sm opacity-80">{about}</p>
            {(contactPhone || contactEmail || contactAddress) && (
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
          {renderColumns(columns)}
        </div>
      )}

      {layout === 2 && (
        <div
          className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:px-8"
          style={contentStyle}
        >
          <div className="space-y-4">
            <StoreLogo store={store} configuredLogo={effectiveFooter?.logo} />
            <p className="max-w-sm opacity-80">{about}</p>
          </div>
          {renderColumns(columns)}
          <div className="space-y-5">
            <SocialLinks
              links={availableSocialLinks}
              style={effectiveFooter?.socialIconStyle}
            />
            {(contactPhone || contactEmail || contactAddress) && (
              <ContactDetails
                phone={contactPhone}
                email={contactEmail}
                address={contactAddress}
              />
            )}
          </div>
        </div>
      )}

      {layout === 3 && (
        <div
          className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8"
          style={contentStyle}
        >
          <StoreLogo
            store={store}
            configuredLogo={effectiveFooter?.logo}
            centered
          />
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
      )}

      {showBottomBar && (
        <div className="border-t border-current/10 px-4 py-5 sm:px-6 lg:px-8">
          <div
            className={`mx-auto flex flex-col items-center gap-4 ${
              layout === 3
                ? "max-w-4xl justify-center"
                : "max-w-7xl justify-between md:flex-row"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs opacity-70">
              <p>{bottomCopyright}</p>
              {showDeveloperCredit && <p>Powered by SellDesk</p>}
            </div>
            {paymentIcons.length > 0 && <PaymentBadges icons={paymentIcons} />}
          </div>
        </div>
      )}
    </footer>
  );
}
