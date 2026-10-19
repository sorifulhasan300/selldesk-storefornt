"use client";

import React, { useState } from "react";
import type { Product } from "@/shared/types";
import { ProductSpecifications } from "./ProductSpecifications";
import type {
  ProductTabLayout,
  ProductTabItem,
} from "@/shared/types";
import { ChevronDown, FileText, ListFilter } from "lucide-react";

export interface ProductTabsSectionProps {
  product: Product;
  tabLayout?: ProductTabLayout; // 1: Classic, 2: Pill, 3: Accordion, 4: All Expanded
  tabsConfig?: ProductTabItem[];
}

export function ProductTabsSection({
  product,
  tabLayout = 4,
  tabsConfig,
}: ProductTabsSectionProps) {
  // Built-in tabs fallback if not provided
  const activeTabs: ProductTabItem[] =
    Array.isArray(tabsConfig) && tabsConfig.length > 0
      ? tabsConfig
      : [
          {
            key: "description",
            type: "builtin",
            label: "Description",
            content: null,
          },
          {
            key: "specifications",
            type: "builtin",
            label: "Specifications",
            content: null,
          },
        ];

  const [activeTabKey, setActiveTabKey] = useState<string>(
    activeTabs[0]?.key || "description",
  );

  // Accordion open/close state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      activeTabs.forEach((tab) => {
        initial[tab.key] = true;
      });
      return initial;
    },
  );

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderTabContent = (tab: ProductTabItem) => {
    if (tab.key === "description") {
      return (
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
          {product.description ? (
            product.description.split("\n\n").map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))
          ) : (
            <p className="text-slate-400 italic">
              No detailed description provided for this product.
            </p>
          )}
        </div>
      );
    }

    if (tab.key === "specifications") {
      return <ProductSpecifications product={product} />;
    }

    // Custom tab content
    return (
      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
        {tab.content ? (
          /<\/?[a-z][\s\S]*>/i.test(tab.content) ? (
            <div dangerouslySetInnerHTML={{ __html: tab.content }} />
          ) : (
            <p className="whitespace-pre-line">{tab.content}</p>
          )
        ) : (
          <p className="text-slate-400 italic">No additional information available.</p>
        )}
      </div>
    );
  };

  // Layout 4: All Expanded (Stacked sections with left vertical highlight bar)
  if (tabLayout === 4) {
    return (
      <div className="space-y-10 pt-4 border-t border-slate-200/80">
        {activeTabs.map((tab) => (
          <section
            key={tab.key}
            aria-labelledby={`section-${tab.key}`}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 border-l-4 border-[var(--store-primary,#0f172a)] pl-3.5 py-0.5">
              <h2
                id={`section-${tab.key}`}
                className="text-lg sm:text-xl font-black text-slate-900 tracking-tight"
              >
                {tab.label}
              </h2>
            </div>
            <div className="pl-1">{renderTabContent(tab)}</div>
          </section>
        ))}
      </div>
    );
  }

  // Layout 3: Accordion (Collapsible accordion panels with chevron toggles)
  if (tabLayout === 3) {
    return (
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {activeTabs.map((tab) => {
          const isOpen = openAccordions[tab.key] ?? true;
          return (
            <div
              key={tab.key}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(tab.key)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 border-l-4 border-[var(--store-primary,#0f172a)] pl-3">
                  <span className="text-base sm:text-lg font-black">
                    {tab.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[var(--store-primary)]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white">
                  {renderTabContent(tab)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Layout 1: Classic horizontal underline tabs or Layout 2: Pill tabs
  const isPill = tabLayout === 2;
  const currentTab =
    activeTabs.find((t) => t.key === activeTabKey) || activeTabs[0];

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200/80">
      {/* Navigation Headers */}
      <div
        className={`flex items-center gap-2 overflow-x-auto pb-1 ${
          isPill
            ? "p-1.5 bg-slate-100 rounded-2xl max-w-fit"
            : "border-b border-slate-200"
        }`}
      >
        {activeTabs.map((tab) => {
          const isSelected = (currentTab?.key ?? activeTabKey) === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTabKey(tab.key)}
              className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isPill
                  ? `px-5 py-2.5 rounded-xl ${
                      isSelected
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`
                  : `pb-3 px-3 relative ${
                      isSelected
                        ? "text-[var(--store-primary,#0f172a)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--store-primary,#0f172a)]"
                        : "text-slate-500 hover:text-slate-800"
                    }`
              }`}
            >
              {tab.key === "description" ? (
                <FileText className="w-4 h-4" />
              ) : tab.key === "specifications" ? (
                <ListFilter className="w-4 h-4" />
              ) : null}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div className="py-2">
        {currentTab && <div>{renderTabContent(currentTab)}</div>}
      </div>
    </div>
  );
}
