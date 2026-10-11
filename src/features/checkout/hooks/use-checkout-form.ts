"use client";

import { useState, useRef, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/features/cart";
import { StoreDeliveryCharge, CheckoutDto } from "@/shared/types";
import { StorefrontService } from "@/services/storefront.service";
import { checkoutFormSchema } from "../schemas/checkout.schema";
import {
  normalizePhone,
  toSafeErrorMessage,
  resolveOrderUrl,
} from "../utils/checkout.utils";

interface UseCheckoutFormOptions {
  storeSlug: string;
  deliveryChargeConfig?: StoreDeliveryCharge;
}

export function useCheckoutForm({
  storeSlug,
  deliveryChargeConfig,
}: UseCheckoutFormOptions) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { items, subtotal, discount, coupon, applyCoupon, clearCart } =
    useCart(storeSlug);

  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [cityZone, setCityZone] = useState<"inside" | "outside" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Concurrency and idempotency protection (G3, SKILL.md 6.2)
  const submittingRef = useRef(false);
  const idemKeyRef = useRef<string | null>(null);
  const payloadHashRef = useRef<string>("");

  const insideFee = deliveryChargeConfig?.insideCity ?? 50;
  const outsideFee = deliveryChargeConfig?.outsideCity ?? 100;
  const currentDeliveryFee =
    cityZone === "inside" ? insideFee : cityZone === "outside" ? outsideFee : 0;

  const total = Math.max(0, subtotal - discount + currentDeliveryFee);

  const handleApplyCoupon = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    if (subtotal <= 0) {
      toast.error("Your cart must have items to apply a coupon");
      return;
    }

    setValidatingCoupon(true);
    try {
      const result = await StorefrontService.validateCoupon(
        storeSlug,
        code,
        subtotal,
      );
      applyCoupon(result);
      toast.success(`Coupon applied: ${code}`);
      setCouponCode("");
    } catch {
      applyCoupon(null);
      toast.error("This coupon is invalid or not applicable");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    toast.info("Coupon removed");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Client-side schema validation (G6, SEC4)
    const validationResult = checkoutFormSchema.safeParse({
      customerName,
      customerPhone,
      shippingAddress,
      cityZone: cityZone ?? undefined,
      paymentMethod,
      notes: notes || undefined,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0];
        if (field && !errors[String(field)]) {
          errors[String(field)] = issue.message;
        }
      }
      setFieldErrors(errors);
      const firstErrorMessage = validationResult.error.issues[0]?.message;
      if (firstErrorMessage) toast.error(firstErrorMessage);
      return;
    }

    setFieldErrors({});
    submittingRef.current = true;
    setLoading(true);

    try {
      const normalizedPhone = normalizePhone(customerPhone);
      const currentPayloadHash = JSON.stringify({
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        shippingAddress: shippingAddress.trim(),
        cityZone,
        paymentMethod,
        items: items.map((i) => ({ id: i.id, q: i.quantity })),
      });

      // Maintain or generate idempotency key
      if (
        !idemKeyRef.current ||
        payloadHashRef.current !== currentPayloadHash
      ) {
        idemKeyRef.current = crypto.randomUUID();
        payloadHashRef.current = currentPayloadHash;
      }

      // Authoritative security: client sends IDs and quantities only (G1, SEC1)
      const payload: CheckoutDto = {
        customerName: customerName.trim(),
        customerPhone: normalizedPhone,
        shippingAddress: shippingAddress.trim(),
        city: cityZone === "inside" ? "Inside City" : "Outside City",
        notes: notes.trim() || undefined,
        paymentMethod,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await StorefrontService.checkout(storeSlug, payload, {
        idempotencyKey: idemKeyRef.current,
      });

      clearCart();
      idemKeyRef.current = null;
      payloadHashRef.current = "";
      toast.success("Order placed successfully!");

      const orderRef = res.orderNumber || res.id || "confirmation";
      const targetUrl = resolveOrderUrl(
        storeSlug,
        orderRef,
        (res as { accessToken?: string }).accessToken,
      );

      startTransition(() => {
        router.replace(targetUrl);
      });
    } catch (err: unknown) {
      toast.error(toSafeErrorMessage(err));
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return {
    items,
    subtotal,
    discount,
    coupon,
    total,
    loading,
    validatingCoupon,
    fieldErrors,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    shippingAddress,
    setShippingAddress,
    cityZone,
    setCityZone,
    insideFee,
    outsideFee,
    currentDeliveryFee,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSubmit,
  };
}

