export const LOCAL_BUILDER_ORIGINS = [
  "http://app.selldesk.test:3000",
  "http://localhost:3000",
] as const;

function getConfiguredBuilderOrigins(configuredOrigins: string): string[] {
  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => {
      try {
        const url = new URL(origin);
        return (
          (url.protocol === "https:" || url.protocol === "http:") &&
          url.origin === origin
        );
      } catch {
        return false;
      }
    });
}

export const BUILDER_ORIGINS = [
  ...LOCAL_BUILDER_ORIGINS,
  ...getConfiguredBuilderOrigins(
    process.env.NEXT_PUBLIC_BUILDER_ORIGINS ?? "",
  ),
];
