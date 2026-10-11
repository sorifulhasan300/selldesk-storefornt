import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  customerPhone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(16, "Phone number cannot exceed 16 digits")
    .regex(
      /^(?:\+?88)?01[3-9]\d{8}$|^\+?[1-9]\d{7,14}$/,
      "Please enter a valid phone number (e.g. 01712345678)",
    ),
  shippingAddress: z
    .string()
    .trim()
    .min(5, "Shipping address must be at least 5 characters")
    .max(300, "Shipping address cannot exceed 300 characters"),
  cityZone: z.enum(["inside", "outside"], {
    message: "Please select a delivery zone",
  }),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

