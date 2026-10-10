---
name: cart-and-checkout-lifecycle
description: Rules for the SellDesk storefront cart, coupon, delivery-fee, checkout and order-placement flow, including the checkout security golden rules (never trust the client, server-side price recalculation, idempotency, stock race protection, payment verification, abuse prevention). MUST be used whenever the task touches cart stores (use-cart-store, use-cart), cart drawer, add-to-cart buttons, coupon apply, delivery charge, checkout form, order placement, order confirmation page, or anything involving money, stock or customer PII in selldesk-storefront. Use it even for "small" changes like quantity buttons, toasts or redirects, because those are where revenue and security bugs hide.
---

# Cart & Checkout Lifecycle

The cart-to-order funnel is the revenue path of `selldesk-storefront`. Bugs here cost money (wrong totals, oversold stock, duplicate orders) and trust (cart leaking between stores, PII exposure).

**How to use this skill (for AI agents):**
1. Read **Section 0 (Golden Rules)** first. These are hard constraints and override convenience.
2. Read only the sections relevant to your task (map in Section 1).
3. Before finishing, run the **Definition of Done** checklist (Section 11).
4. If a user request conflicts with a Golden Rule, do not silently comply. Explain the risk and propose a safe alternative.

---

## 0. Checkout Golden Rules (non-negotiable)

| # | Rule | What it means in this codebase |
|---|------|-------------------------------|
| G1 | **Never trust the client** | Prices, discounts, delivery fee, totals and stock shown in the UI are *estimates for display*. The server recalculates everything from product IDs, quantities, coupon code and zone. The client must never send `price`, `total`, `discount` or `deliveryFee` as authoritative values. |
| G2 | **Server is the source of truth for money** | The checkout response returns the final totals. If they differ from what the user saw, stop, show the updated summary and ask the user to confirm again. Never silently charge a different amount. |
| G3 | **Idempotent order placement** | Every checkout attempt carries an `Idempotency-Key`. The same key must never create two orders (server unique constraint). A disabled button alone is NOT idempotency. |
| G4 | **Re-validate at the last moment** | Coupon validity, stock, product availability and delivery config are re-checked server-side inside the order transaction, not only when the user clicked "Apply" or "Add". |
| G5 | **Atomic stock handling** | Stock check and decrement happen in one DB transaction (or atomic conditional update). No read-then-write across requests. Prevents overselling under concurrency. |
| G6 | **Validate on both sides, trust only the server** | Client validation is UX. The API validates the same rules (shared schema, e.g. zod) and rejects bad input with safe messages. |
| G7 | **Tenant isolation** | Every cart, coupon, product and order query is scoped by `storeSlug`/`storeId`. A cart, coupon or order from Store A must never work in Store B. |
| G8 | **No card data, ever** | Never collect, store or log card numbers/CVV. Online payment uses a hosted page or tokenized SDK (PCI DSS scope stays minimal). COD and mobile-wallet flows follow Section 8. |
| G9 | **Payment confirmation comes from the server** | A browser redirect back from a gateway is NOT proof of payment. Mark an order paid only after a server-to-server verification or a signature-verified webhook. |
| G10 | **Protect PII** | Name, phone and address are never written to `localStorage`, URLs, analytics events, or console logs. Orders are never readable by guessing an ID (see Section 7). |
| G11 | **Abuse prevention** | Rate-limit coupon validation and checkout endpoints; add bot protection and COD fraud controls (Section 8). Coupon errors must not let attackers enumerate valid codes. |
| G12 | **Generic errors outward, detailed errors inward** | Show users safe messages. Log details server-side with a request ID. Never display raw stack traces, SQL errors or internal IDs in toasts. |
| G13 | **Money is exact** | Use integers (smallest currency unit) on the server, and round once at a defined step. Never accumulate floating point errors across line items. |
| G14 | **Auditability** | Order creation, coupon redemption, payment status changes and stock changes are logged with timestamp, store, order ID and actor. |

If you modify any file listed in Section 1, mentally verify each of G1 to G14 still holds.

---

## 1. File Map (where to look)

| Concern | File |
|---------|------|
| Cart state, persistence | `src/store/use-cart-store.ts` |
| Store-scoped hook | `src/hooks/use-cart.ts` |
| Cart drawer / add-to-cart UI | cart drawer + product components |
| Checkout form, zone, totals | `src/components/checkout/checkout-form.tsx` |
| API calls (coupon, checkout) | `StorefrontService` |
| Order confirmation page | `/store/[storeSlug]/orders/[orderNumber]` |

---

## 2. Store-Partitioned Cart State

Shoppers may visit Store A then Store B. Cart items from one store must **never** appear in another.

### 2.1 Rules
- Persist with Zustand `persist` under the key `selldesk_storefront_cart`, using `partialize` so only `storeSlug`, `items`, `coupon` are saved (never PII, never `isOpen`).
- On store change (`state.storeSlug !== newSlug`) reset `items` and `coupon`.
- Add a persist `version` and `migrate` function so a schema change does not crash returning shoppers.
- Add an expiry (for example `updatedAt` older than 30 days means discard) so stale prices and dead products do not linger.
- Persisted item prices are **snapshots**. Treat them as stale; refresh from the API when the cart drawer or checkout opens, and flag items whose price changed or that went out of stock.

### 2.2 Hydration safety (common agent mistake)
`initStore(slug)` must not run before the persisted state has rehydrated, otherwise it sees `storeSlug === ""` and wipes a valid cart. In Next.js, also avoid SSR/client mismatch by not rendering cart counts until hydrated.

```typescript
// src/store/use-cart-store.ts (essentials)
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      storeSlug: "",
      items: [],
      isOpen: false,
      coupon: null,
      hasHydrated: false,

      initStore: (slug: string) => {
        if (get().storeSlug !== slug) {
          set({ storeSlug: slug, items: [], coupon: null });
        }
      },
      // actions & selectors (Section 3)
    }),
    {
      name: "selldesk_storefront_cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ storeSlug: s.storeSlug, items: s.items, coupon: s.coupon }),
      onRehydrateStorage: () => () => useCartStore.setState({ hasHydrated: true }),
    },
  ),
);
```

### 2.3 Store scoping hook
All client components use `useCart(storeSlug)`. Use **selectors** so components do not re-render on every unrelated store change, and keep the effect dependency list stable (the whole store object changes identity on every update and causes effect churn).

```typescript
// src/hooks/use-cart.ts
export function useCart(storeSlug: string) {
  const initStore = useCartStore((s) => s.initStore);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && storeSlug) initStore(storeSlug);
  }, [hasHydrated, storeSlug, initStore]);

  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const subtotal = computeSubtotal(items);
  const discount = computeDiscount(subtotal, coupon);

  return {
    items, coupon, hasHydrated,
    subtotal, discount,
    total: Math.max(0, subtotal - discount), // display estimate only (G1)
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    addItem: useCartStore((s) => s.addItem),
    updateQuantity: useCartStore((s) => s.updateQuantity),
    removeItem: useCartStore((s) => s.removeItem),
    clearCart: useCartStore((s) => s.clearCart),
  };
}
```

---

## 3. Cart Operations & Stock Clamping

### 3.1 Item identity
A line is identified by a composite key, never by product ID alone, so two variants of one product do not merge:

```typescript
const cartItemKey = (productId: string, variantId?: string | null) =>
  `${productId}:${variantId ?? "base"}`;
```

### 3.2 `addItem` rules
1. Deduplicate by the composite key.
2. Clamp quantity to `maxStock ?? MAX_QTY_PER_LINE` (use `??`, not `||`, because `maxStock = 0` means **out of stock** and `||` would wrongly turn it into 99).
3. Clamp **new** lines too, not only existing ones.
4. If nothing can be added (out of stock, already at max), do not change state and return a reason so the UI shows a toast. The store must not call toast itself.
5. On a successful add, set `isOpen: true`.

```typescript
const MAX_QTY_PER_LINE = 99;

addItem: (input) => {
  const key = cartItemKey(input.productId, input.variantId);
  const limit = Math.min(input.maxStock ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
  if (limit <= 0) return { ok: false, reason: "OUT_OF_STOCK" } as const;

  const { items } = get();
  const existing = items.find((i) => i.key === key);
  const current = existing?.quantity ?? 0;
  const next = Math.min(current + input.quantity, limit);
  if (next === current) return { ok: false, reason: "MAX_REACHED" } as const;

  set({
    items: existing
      ? items.map((i) => (i.key === key ? { ...i, quantity: next, maxStock: limit } : i))
      : [...items, { ...input, key, quantity: next, maxStock: limit }],
    isOpen: true,
  });
  return { ok: true, clamped: current + input.quantity > limit } as const;
},
```

Caller example: `const r = addItem(...); if (!r.ok) toast.error(r.reason === "OUT_OF_STOCK" ? "Out of stock" : "Maximum quantity already in cart"); else if (r.clamped) toast.info("Quantity adjusted to available stock");`

### 3.3 `updateQuantity`
- Quantity must be an integer. Reject `NaN`, decimals and negatives.
- Result `<= 0` removes the line. Result above the limit is clamped.
- Stock shown in the cart is a hint. The real check is server-side (G4, G5).

---

## 4. Delivery Fee

Configured per store:

```typescript
export interface StoreDeliveryCharge {
  insideCity?: number;
  outsideCity?: number;
}
```

### 4.1 Display estimate (client)
```typescript
const insideFee = deliveryChargeConfig?.insideCity ?? 50;   // fallback is display-only
const outsideFee = deliveryChargeConfig?.outsideCity ?? 100;
const currentDeliveryFee = cityZone === "inside" ? insideFee : outsideFee;
const grandTotal = Math.max(0, subtotal - discount + currentDeliveryFee);
```

### 4.2 Rules
- The client numbers are an estimate (G1). The API recomputes the fee from the store config and the submitted zone.
- Hardcoded fallbacks (50/100) must never be the only source of a charged fee. If the store config is missing, the server decides.
- `cityZone` has no default. The user must choose (Section 6).
- Discounts do not reduce shipping unless an explicit free-shipping flag exists.

---

## 5. Coupons

Validated through `StorefrontService.validateCoupon(storeSlug, code, subtotal)`.

### 5.1 Calculation
- `PERCENTAGE`: `Math.round((subtotal * amount) / 100)`, with `amount` limited to 0..100, optional `maxDiscount` cap.
- `FIXED` / `FIXED_AMOUNT`: `Math.min(amount, subtotal)`.
- **Floor rule:** `0 <= discount <= subtotal` for every type. Clamp the result of both types.

### 5.2 Server-side coupon rules (G4, G7, G11)
The API must enforce, at validation **and again at checkout**: store scope, active/expiry window, minimum order value, total usage limit, per-customer limit, and applicability. Coupons validated earlier are not trusted at order time.

### 5.3 Client behavior
- Trim and uppercase the code before sending; ignore empty input.
- While validating: `validatingCoupon = true`, disable "Apply", show `<Loader2 className="w-4 h-4 animate-spin" />`.
- Success: store coupon, `toast.success("Coupon applied: CODE")`.
- Failure: clear coupon, restore totals, show a **safe** message. Prefer a fixed message such as "This coupon is invalid or not applicable" over echoing raw `err.message`, so the UI does not reveal why a code failed or that it exists (G11, G12).
- **Re-validate when the subtotal changes** (item added, removed, quantity changed). A minimum-order coupon can become invalid after the cart changes. Either re-call validate (debounced) or drop the coupon with a toast.
- Coupon endpoint: rate-limited server-side to stop code brute-forcing.

---

## 6. Checkout Form & Submission

### 6.1 Validation (client, mirrored on server per G6)
Use one shared schema if possible.
1. Empty cart: block with `toast.error("Your cart is empty")`.
2. Name: trimmed, 2 to 80 characters.
3. Phone: required, normalized then validated. Bangladesh mobile example: `^(?:\+?88)?01[3-9]\d{8}$`. Store the normalized form.
4. Address: trimmed, 5 to 300 characters.
5. Zone: explicitly selected (`"inside"` or `"outside"`), no silent default.
6. Notes: optional, length-limited (for example 500).
7. Payment method: must be one of the methods the store currently enables.

Render user-provided text only as plain text in React. Never use `dangerouslySetInnerHTML` for names, addresses or notes (stored XSS in the admin dashboard).

### 6.2 Double-submit protection (two layers, plus G3)
`disabled={loading}` is not enough, because state updates are asynchronous and a fast double tap can fire twice before re-render.

1. **Synchronous lock:** `useRef` flag checked at the top of the handler.
2. **UI lock:** `disabled={loading}` and `<Loader2 className="w-4 h-4 animate-spin mr-2" /> Placing Order...`.
3. **Idempotency key:** generated once per checkout attempt, sent as the `Idempotency-Key` header, and stored in a `useRef` (or `sessionStorage`) so a retry after a timeout or network drop reuses it.
   - Reuse the key if the user retries the **same** payload.
   - Generate a new key if the cart, address, coupon or payment method changed.
   - Clear it after success.
4. `try...catch...finally` so loading state and the ref lock always release.

```typescript
const submittingRef = useRef(false);
const idemKeyRef = useRef<string | null>(null);

async function onSubmit() {
  if (submittingRef.current) return;
  if (items.length === 0) return toast.error("Your cart is empty");
  // ...field validation, return early on failure

  submittingRef.current = true;
  setLoading(true);
  try {
    idemKeyRef.current ??= crypto.randomUUID();

    // NO prices, totals, discounts or fees in the payload (G1)
    const payload: CheckoutDto = {
      customerName: customerName.trim(),
      customerPhone: normalizePhone(customerPhone),
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

    // G2: if server total differs from what the user saw, do not proceed silently
    if (res.total !== undefined && res.total !== grandTotal) {
      // show reconciled summary and ask for confirmation (or handle per product decision)
    }

    clearCart();
    idemKeyRef.current = null;
    toast.success("Order placed successfully!");
    router.replace(`/store/${storeSlug}/orders/${res.orderNumber || res.id}?t=${res.accessToken}`);
  } catch (err) {
    toast.error(toSafeMessage(err)); // map known codes: OUT_OF_STOCK, PRICE_CHANGED, COUPON_INVALID...
  } finally {
    submittingRef.current = false;
    setLoading(false);
  }
}
```

### 6.3 Handling server rejections
Map API error codes to specific UX, not a generic toast:
- `OUT_OF_STOCK` / `STOCK_CHANGED`: refresh cart, clamp quantities, tell the user which items changed.
- `PRICE_CHANGED`: refresh prices, show the new total, require re-confirmation.
- `COUPON_INVALID`: remove coupon, show new total.
- `RATE_LIMITED`: tell the user to wait and retry.
- Network error or timeout: keep the same idempotency key and let the user retry safely.

Never clear the cart on failure.

---

## 7. Post-Checkout

On success only:
1. `clearCart()` (empties store and purges persisted cart) and reset the idempotency key.
2. Use `router.replace` (not `push`) so Back does not return to a filled checkout form.
3. Redirect to `/store/[storeSlug]/orders/[orderNumber]` (always include the store slug in the route).
4. The confirmation page shows the order reference, items, final server-calculated totals, delivery estimate, and payment instructions (COD or wallet).

**Order page access (G10):** Order numbers are sequential and guessable. A guest must not be able to read other customers' name, phone or address by changing the number. Require one of: an unguessable access token returned at checkout (`?t=`), a signed short-lived link, or authentication plus ownership check. The API verifies the token server-side and scopes by store (G7). Mask phone/address partially where full values are unnecessary.

---

## 8. Payments, Fraud & Abuse Controls

- **Online payment (G8, G9):** use hosted checkout or tokenization. After the gateway redirects back, call your server to verify the transaction with the gateway, or rely on a signature-verified webhook. Verify amount, currency, order reference and that the transaction ID was not already used. Webhook handlers must be idempotent.
- **Order state machine:** `PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED` plus `CANCELLED`/`REFUNDED`. Only legal transitions are allowed, server-side.
- **Cash on Delivery risk (fake-order abuse is common):** consider phone OTP verification, per-phone and per-IP order limits, max COD order value for new customers, and admin flags for repeated cancellations.
- **Bot protection:** CAPTCHA or invisible challenge (for example Turnstile) on checkout and coupon endpoints, plus honeypot field if appropriate.
- **Rate limits:** per IP and per phone on `checkout`, `validateCoupon`, and order lookup.
- **Transport and headers:** HTTPS only; CSRF protection if cookie-based auth is used; strict CORS allowlist; a sensible CSP.
- **Logging (G10, G14):** log order IDs and request IDs, never full PII or secrets. Never log coupon brute-force attempts with sensitive details beyond what is needed.

---

## 9. Backend Contract (if the task also touches the API)

The storefront is only safe if the API does the following inside a single transaction:
1. Load products and variants by ID **within the store** (G7). Reject unknown or inactive items.
2. Verify stock and decrement atomically, for example `UPDATE ... SET stock = stock - :q WHERE id = :id AND stock >= :q` and check the affected row count (G5).
3. Compute subtotal from DB prices, apply coupon rules, compute delivery fee from store config, compute total in integer units (G1, G13).
4. Insert the order with a unique `(storeId, idempotencyKey)` constraint. On conflict, return the existing order (G3).
5. Increment coupon usage in the same transaction.
6. Return the authoritative totals and an order access token.

---

## 10. Anti-Patterns (do not do these)

| Do not | Do instead |
|--------|-----------|
| Send `price`/`total`/`discount` from the client as truth | Send IDs and quantities only; server computes |
| `maxStock \|\| 99` | `maxStock ?? 99` and treat `0` as out of stock |
| Dedupe cart lines by `productId` only | Composite `productId:variantId` key |
| Call `initStore` before hydration | Wait for `hasHydrated` |
| `useEffect` deps including the whole store object | Select `initStore` with a selector |
| Rely on `disabled={loading}` alone | Ref lock + idempotency key |
| Clear the cart before the API confirms | Clear only after success |
| Trust the payment gateway redirect | Verify server-side or via signed webhook |
| Persist name/phone/address in `localStorage` | Keep form state in memory only |
| Show `err.message` raw | Map error codes to safe messages |
| Read orders by sequential ID alone | Require access token or ownership |
| Float math for totals on the server | Integer minor units, round once |
| Calling toast from inside the store | Store returns a result; UI shows the toast |

---

## 11. Definition of Done (checklist before you finish)

- [ ] No client-calculated money value is sent to or trusted by the API (G1, G2).
- [ ] Cart is isolated per store; switching stores clears it; hydration cannot wipe a valid cart.
- [ ] `maxStock = 0` cannot be added; new and existing lines are both clamped.
- [ ] Coupon is re-validated on cart change and on the server at checkout; discount never exceeds subtotal.
- [ ] Checkout has ref lock, disabled button with spinner, `try/finally`, and an idempotency key reused on retry.
- [ ] Server error codes map to specific, safe UX messages; cart is not cleared on failure.
- [ ] After success: cart cleared, key reset, `router.replace` to the store-scoped order route with an access token.
- [ ] No PII in `localStorage`, URLs (except the opaque token), logs or analytics.
- [ ] Form inputs validated client-side and on the server with the same rules; text rendered safely (no raw HTML).
- [ ] Payment status changes only after server-side verification.
- [ ] Manual test run: double-click submit, slow 3G submit, offline retry, two tabs with different stores, out-of-stock item, expired coupon, price change between add and checkout.
