import Image from "next/image";
import Link from "next/link";
import type { StoreConfig, StorefrontFooterConfig } from "@/shared/types";

export function StoreLogo({
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

