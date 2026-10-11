import { env } from "@/shared/config/env";
import type { StoreConfig } from "@/shared/types";

export function getStoreOrigin(
  store: Pick<StoreConfig, "domain" | "subDomain">,
): string {
  const domain =
    store.domain?.trim() ||
    `${store.subDomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN.split(":")[0]}`;
  const url = new URL(`https://${domain}`);

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Store canonical domain is invalid");
  }

  return url.origin;
}
