import { PaymentBadges } from "./store-footer-payment";

export interface FooterBottomBarProps {
  layout: number;
  bottomCopyright: string;
  showDeveloperCredit: boolean;
  paymentIcons: string[];
}

export function FooterBottomBar({
  layout,
  bottomCopyright,
  showDeveloperCredit,
  paymentIcons,
}: FooterBottomBarProps) {
  return (
    <div className="border-t border-current/10 px-4 py-5 sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex flex-col items-center gap-4 ${
          layout === 3
            ? "max-w-4xl justify-center"
            : "w-full max-w-[var(--store-content-max-w,1200px)] justify-between md:flex-row"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs opacity-70">
          <p>{bottomCopyright}</p>
          {showDeveloperCredit && <p>Powered by SellDesk</p>}
        </div>
        {paymentIcons.length > 0 && <PaymentBadges icons={paymentIcons} />}
      </div>
    </div>
  );
}

