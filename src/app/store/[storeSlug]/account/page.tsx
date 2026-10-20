import { redirect } from "next/navigation";
import { getBootstrap } from "@/features/tenant/server";
import { CustomerAccountPage } from "@/features/customer-account";

export const metadata = {
  title: "Your account",
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const bootstrap = await getBootstrap(storeSlug);

  const accountConfig = bootstrap.config?.account ?? bootstrap.account;
  if (accountConfig?.active === false) {
    redirect(
      process.env.NODE_ENV === "development" ? `/store/${storeSlug}` : "/",
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <CustomerAccountPage storeSlug={storeSlug} />
    </div>
  );
}
