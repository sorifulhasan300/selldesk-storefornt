import React from "react";
import type { Product } from "@/shared/types";

export interface ProductSpecificationsProps {
  product: Product;
  className?: string;
}

interface SpecItem {
  label: string;
  value: string;
}

function parseSpecifications(product: Product): SpecItem[] {
  const specs = product.specifications;
  const items: SpecItem[] = [];

  if (specs) {
    if (Array.isArray(specs)) {
      for (const entry of specs) {
        if (entry && typeof entry === "object") {
          const label = entry.label || entry.key || entry.name || "";
          const value = entry.value || entry.val || entry.description || "";
          if (label && value) {
            items.push({
              label: String(label),
              value: String(value),
            });
          }
        }
      }
    } else if (typeof specs === "object") {
      for (const [key, val] of Object.entries(specs)) {
        if (val != null && val !== "") {
          const formattedLabel = key
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();
          items.push({
            label: formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1),
            value: typeof val === "object" ? JSON.stringify(val) : String(val),
          });
        }
      }
    }
  }

  // Graceful fallback to standard product attributes if custom specifications are not provided
  if (items.length === 0) {
    const brandName =
      product.brand?.name ??
      (typeof product.brand === "string" ? product.brand : null);

    if (product.category?.name) {
      items.push({ label: "Category", value: product.category.name });
    }
    if (brandName) {
      items.push({ label: "Brand", value: brandName });
    }
    if (product.sku || product.variants?.[0]?.sku) {
      items.push({
        label: "SKU / Model",
        value: product.sku || product.variants[0].sku,
      });
    }
    if (product.hasVariants && product.variants?.length > 0) {
      const options = Array.from(
        new Set(
          product.variants.flatMap((v) =>
            v.attributes ? Object.keys(v.attributes) : [],
          ),
        ),
      );
      if (options.length > 0) {
        items.push({
          label: "Available Options",
          value: options.join(", "),
        });
      }
    }

    // Standard e-commerce assurance fallbacks
    items.push({ label: "Material", value: "Premium High-Grade Material" });
    items.push({ label: "Package Includes", value: "1x Complete Unit with Accessories" });
    items.push({ label: "Warranty", value: "7 Days Instant Replacement Guarantee" });
    items.push({ label: "Authenticity", value: "100% Original Brand Certified" });
  }

  return items;
}

export function ProductSpecifications({
  product,
  className = "",
}: ProductSpecificationsProps) {
  const specs = parseSpecifications(product);

  return (
    <div
      className={`border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <tbody>
            {specs.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={index}
                  className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                    isEven ? "bg-slate-50/60" : "bg-white"
                  } hover:bg-slate-100/60`}
                >
                  <td className="w-1/3 py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 border-r border-slate-100 align-top">
                    {item.label}
                  </td>
                  <td className="w-2/3 py-3.5 px-5 font-bold text-slate-800 text-sm align-top leading-relaxed">
                    {item.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

