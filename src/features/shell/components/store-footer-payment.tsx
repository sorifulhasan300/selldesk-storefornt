export function PaymentBadges({ icons }: { icons: string[] }) {
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

