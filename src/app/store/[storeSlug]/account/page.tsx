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
  return <CustomerAccountPage storeSlug={storeSlug} />;
}
