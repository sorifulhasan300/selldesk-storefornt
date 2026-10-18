import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export interface StoreFooterContactConfig {
  phone?: string;
  email?: string;
  address?: string;
}

export function ContactDetails({
  phone,
  email,
  address,
}: StoreFooterContactConfig) {
  const details: { icon: ReactNode; value?: string }[] = [
    { icon: <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />, value: phone },
    { icon: <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />, value: email },
    { icon: <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />, value: address },
  ];

  return (
    <address className="space-y-2 pt-2 not-italic">
      {details.map(
        ({ icon, value }, index) =>
          value && (
            <div key={`${value}-${index}`} className="flex items-center gap-2">
              {icon}
              <span>{value}</span>
            </div>
          ),
      )}
    </address>
  );
}

