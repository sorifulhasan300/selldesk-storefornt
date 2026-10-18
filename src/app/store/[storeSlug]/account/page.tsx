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
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <CustomerAccountPage storeSlug={storeSlug} />
    </div>
  );
}
