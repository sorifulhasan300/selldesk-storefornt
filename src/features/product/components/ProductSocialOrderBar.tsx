"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, MessageSquare, PhoneCall } from "lucide-react";
import {
  buildWhatsAppOrderUrl,
  buildMessengerOrderUrl,
  buildHotlineTelUrl,
} from "../utils/product-url.utils";

export interface ProductSocialOrderBarProps {
  productName: string;
  price: number | string;
  phone?: string | null;
  whatsappPhone?: string | null;
  messengerId?: string | null;
  currentUrl?: string;
  className?: string;
}

export function ProductSocialOrderBar({
  productName,
  price,
  phone,
  whatsappPhone,
  messengerId,
  currentUrl: initialUrl,
  className = "",
}: ProductSocialOrderBarProps) {
  const [resolvedUrl, setResolvedUrl] = useState(initialUrl || "");

  useEffect(() => {
    if (!resolvedUrl && typeof window !== "undefined") {
      setResolvedUrl(window.location.href);
    }
  }, [resolvedUrl]);

  const targetWhatsapp = whatsappPhone || phone || "01700000000";
  const targetPhone = phone || whatsappPhone || "01700000000";
  const targetMessenger = messengerId || "";

  const whatsappUrl = buildWhatsAppOrderUrl({
    phone: targetWhatsapp,
    productName,
    price,
    currentUrl: resolvedUrl,
  });

  const messengerUrl = targetMessenger
    ? buildMessengerOrderUrl(targetMessenger)
    : null;

  const hotlineUrl = buildHotlineTelUrl(targetPhone);

  return (
    <div className={`space-y-2.5 pt-2 ${className}`}>
      {/* WhatsApp & Messenger Quick Chat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* WhatsApp Order Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-bold text-xs shadow-xs transition-all hover:opacity-95 active:scale-[0.99] cursor-pointer"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-4 h-4 shrink-0 fill-current" />
          <span>Order via WhatsApp</span>
        </a>

        {/* Messenger Order Button */}
        {messengerUrl ? (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-white font-bold text-xs shadow-xs transition-all hover:opacity-95 active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: "#0084FF" }}
          >
            <MessageSquare className="w-4 h-4 shrink-0 fill-current" />
            <span>Chat on Messenger</span>
          </a>
        ) : (
          <a
            href={hotlineUrl}
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>Hotline: {targetPhone}</span>
          </a>
        )}
      </div>

      {/* Direct Hotline Dial if messenger was shown */}
      {messengerUrl && (
        <a
          href={hotlineUrl}
          className="flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200/80 transition-colors active:scale-[0.99] cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Call Hotline: {targetPhone}</span>
        </a>
      )}
    </div>
  );
}

