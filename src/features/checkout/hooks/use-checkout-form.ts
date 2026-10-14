"use client";

import {
  useState,
  useRef,
  useTransition,
  FormEvent,
  useMemo,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/features/cart";
import { StoreDeliveryCharge, CheckoutDto, DeliveryZone } from "@/shared/types";
import { checkoutService } from "../services/checkout.service";
import { checkoutFormSchema } from "../schemas/checkout.schema";
import {
  normalizePhone,
  toSafeErrorMessage,
  resolveOrderUrl,
  resolveCheckoutDeliveryFee,
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

  // Dynamic zones extraction
  const zones: DeliveryZone[] = useMemo(() => {
    if (
      deliveryChargeConfig?.zones &&
      Array.isArray(deliveryChargeConfig.zones) &&
      deliveryChargeConfig.zones.length > 0
    ) {
      return deliveryChargeConfig.zones;
    }
    return [
      {
        name: "Inside Dhaka",
        charge: deliveryChargeConfig?.insideCity ?? 60,
        districts: ["Dhaka"],
      },
      {
        name: "Outside Dhaka",
        charge: deliveryChargeConfig?.outsideCity ?? 120,
        districts: [],
      },
    ];
  }, [deliveryChargeConfig]);

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [cityZone, setCityZone] = useState<string>(
    () => zones[0]?.name || "Inside Dhaka",
  );
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // Concurrency and idempotency protection (G3, SKILL.md 6.2)
  const submittingRef = useRef(false);
  const idemKeyRef = useRef<string | null>(null);
  const payloadHashRef = useRef<string>("");

  useEffect(() => {
    if (zones.length > 0 && !cityZone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCityZone(zones[0].name);
    }
  }, [zones, cityZone]);

  // Delivery fee resolution
  const {
    fee: currentDeliveryFee,
    isFreeDelivery,
    matchedZone,
  } = useMemo(() => {
    return resolveCheckoutDeliveryFee(deliveryChargeConfig, subtotal, {
      customerDistrict: district,
      selectedZoneName: cityZone,
      cityZone,
    });
  }, [deliveryChargeConfig, subtotal, district, cityZone]);

  // Handler for changing district: auto-selects matching zone
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    if (!newDistrict) return;

    const matched = zones.find(
      (z) =>
        Array.isArray(z.districts) &&
        z.districts.some(
          (d) =>
            d.toLowerCase() === newDistrict.toLowerCase() ||
            newDistrict.toLowerCase().includes(d.toLowerCase()),
        ),
    );

    if (matched) {
      setCityZone(matched.name);
    } else {
      const outsideZone =
        zones.find(
          (z) =>
            /outside/i.test(z.name) || !z.districts || z.districts.length === 0,
        ) || zones[zones.length - 1];
      if (outsideZone) {
        setCityZone(outsideZone.name);
      }
    }
  };

  // Handler for selecting zone card: updates zone and syncs district if possible
  const handleZoneSelect = (zoneName: string) => {
    setCityZone(zoneName);
    const selected = zones.find(
      (z) =>
        z.name.toLowerCase() === zoneName.toLowerCase() ||
        (zoneName === "inside" && /inside/i.test(z.name)) ||
        (zoneName === "outside" && /outside/i.test(z.name)),
    );

    if (selected && selected.districts && selected.districts.length > 0) {
      if (
        !selected.districts.some(
          (d) => d.toLowerCase() === district.toLowerCase(),
        )
      ) {
        setDistrict(selected.districts[0]);
      }
    }
  };

  const insideFee = deliveryChargeConfig?.insideCity ?? zones[0]?.charge ?? 60;
  const outsideFee =
    deliveryChargeConfig?.outsideCity ?? zones[1]?.charge ?? 120;

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
      const result = await checkoutService.validateCoupon(
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

    const effectiveZone = cityZone || matchedZone?.name || "Inside Dhaka";

    // Client-side schema validation (G6, SEC4)
    const validationResult = checkoutFormSchema.safeParse({
      customerName,
      customerPhone,
      shippingAddress,
      cityZone: effectiveZone,
      district: district || undefined,
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
        cityZone: effectiveZone,
        district: district.trim(),
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
        district: district.trim() || undefined,
        city:
          effectiveZone === "inside"
            ? "Inside Dhaka"
            : effectiveZone === "outside"
              ? "Outside Dhaka"
              : effectiveZone,
        notes: notes.trim() || undefined,
        paymentMethod,
        couponCode: coupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await checkoutService.checkout(storeSlug, payload, {
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
    district,
    setDistrict: handleDistrictChange,
    cityZone,
    setCityZone: handleZoneSelect,
    zones,
    matchedZone,
    isFreeDelivery,
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
