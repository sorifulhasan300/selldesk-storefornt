import { RefreshCcw, ShieldCheck, Truck } from "lucide-react";

export function ValuePropositions() {
  const benefits = [
    {
      title: "Reliable Delivery",
      description: "Fast doorstep shipping across zones",
      icon: <Truck className="h-6 w-6" />,
      className: "bg-[var(--store-primary)]/10 text-[var(--store-primary)]",
    },
    {
      title: "100% Authentic",
      description: "Verified quality guaranteed",
      icon: <ShieldCheck className="h-6 w-6" />,
      className: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Easy Returns",
      description: "Hassle-free 7-day replacement",
      icon: <RefreshCcw className="h-6 w-6" />,
      className: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="border-b border-current/10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 text-center md:grid-cols-3 md:px-6 lg:px-8 md:text-left">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center justify-center gap-4 md:justify-start"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${benefit.className}`}
            >
              {benefit.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold">{benefit.title}</h4>
              <p className="text-xs opacity-70">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

