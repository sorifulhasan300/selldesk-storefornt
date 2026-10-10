import { z } from "zod";

const serverSchema = z.object({
  SERVER_API_URL: z.string().url(),
  REVALIDATE_SECRET: z.string().min(8),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(3),
});

const clientRaw = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://api.selldesk.test:5000/api/v1",
  NEXT_PUBLIC_ROOT_DOMAIN:
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.NEXT_PUBLIC_BASE_DOMAIN?.split(":")[0] ||
    "selldesk.test",
};

const serverRaw = {
  SERVER_API_URL:
    process.env.SERVER_API_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://api.selldesk.test:5000/api/v1",
  REVALIDATE_SECRET:
    process.env.REVALIDATE_SECRET ||
    process.env.REVALIDATION_SECRET ||
    "selldesk_secure_isr_secret_2026",
};

export const env = {
  ...clientSchema.parse(clientRaw),
  ...(typeof window === "undefined"
    ? serverSchema.parse(serverRaw)
    : {
        SERVER_API_URL: "",
        REVALIDATE_SECRET: "",
      }),
};

