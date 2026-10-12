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

const LOCAL_BUILDER_ORIGINS =
  process.env.NODE_ENV === "development"
    ? ["http://app.selldesk.test:3000", "http://localhost:3000"]
    : [];

export const BUILDER_ORIGINS = [
  ...new Set([
    ...LOCAL_BUILDER_ORIGINS,
    ...getConfiguredBuilderOrigins(
      process.env.NEXT_PUBLIC_BUILDER_ORIGINS ?? "",
    ),
  ]),
];
