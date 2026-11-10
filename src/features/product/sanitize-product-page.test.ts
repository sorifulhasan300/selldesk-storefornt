import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactDomServer from "react-dom/server";
import { sanitizeProductPageConfig } from "./server";
import { ProductTabsSection } from "./components/ProductTabsSection";
import { SafeHtml } from "@/shared/ui/safe-html";
import type { Product } from "@/shared/types";

const mockProduct: Product = {
  id: "prod-1",
  name: "Classic Tee",
  slug: "classic-tee",
  description: "Soft combed cotton t-shirt.",
  price: 25,
  salePrice: null,
  stock: 10,
  images: ["https://cdn.selldesk.com/tee.png"],
  hasVariants: false,
  variants: [],
};

describe("product page HTML sanitization & rendering", () => {
  it("sanitizes tabs and sizeGuide in sanitizeProductPageConfig and renders size-guide table", () => {
    const config = sanitizeProductPageConfig({
      sizeGuide: {
        enabled: true,
        title: "Size Guide",
        content:
          '<table><thead><tr><th>Size</th><th>Chest</th></tr></thead><tbody><tr><td>L</td><td>42</td></tr></tbody></table><script>alert("xss")</script><img src="x" onerror="alert(1)" />',
      },
      tabs: [
        {
          key: "care",
          type: "custom",
          label: "Care Guide",
          content:
            '<p><strong>Wash cold</strong></p><ul><li>Hang dry</li></ul><a href="https://example.com/care">More</a><a href="javascript:alert(1)">Bad</a><iframe src="https://evil.example"></iframe>',
        },
      ],
    });

    assert.ok(config?.sizeGuide?.content);
    const sizeGuideHtml = ReactDomServer.renderToStaticMarkup(
      React.createElement(SafeHtml, {
        html: config.sizeGuide.content,
        className: "prose prose-sm max-w-none text-slate-700",
      }),
    );

    assert.match(sizeGuideHtml, /<table><thead><tr><th>Size<\/th><th>Chest<\/th><\/tr><\/thead>/);
    assert.match(sizeGuideHtml, /<tbody><tr><td>L<\/td><td>42<\/td><\/tr><\/tbody><\/table>/);
    assert.equal(sizeGuideHtml.includes("<script"), false);
    assert.equal(sizeGuideHtml.includes("onerror"), false);

    const tabsMarkup = ReactDomServer.renderToStaticMarkup(
      React.createElement(ProductTabsSection, {
        product: mockProduct,
        tabLayout: 4,
        tabsConfig: config?.tabs,
      }),
    );

    assert.equal(tabsMarkup.includes("<strong>Wash cold</strong>"), true);
    assert.equal(tabsMarkup.includes("<ul><li>Hang dry</li></ul>"), true);
    assert.equal(
      tabsMarkup.includes(
        '<a href="https://example.com/care" rel="noopener noreferrer nofollow">More</a>',
      ),
      true,
    );
    assert.equal(tabsMarkup.toLowerCase().includes("javascript:"), false);
    assert.equal(tabsMarkup.includes("<iframe"), false);
  });

  it("renders plain text tabs cleanly without double-escaping entities", () => {
    const config = sanitizeProductPageConfig({
      tabs: [
        {
          key: "notes",
          type: "custom",
          label: "Notes",
          content: "100% Cotton & Linen\nChest < 42",
        },
      ],
    });

    const markup = ReactDomServer.renderToStaticMarkup(
      React.createElement(ProductTabsSection, {
        product: mockProduct,
        tabLayout: 4,
        tabsConfig: config?.tabs,
      }),
    );

    assert.equal(markup.includes("&amp;amp;"), false);
    assert.equal(markup.includes("&amp;lt;"), false);
    assert.equal(markup.includes("100% Cotton &amp; Linen"), true);
    assert.equal(markup.includes("Chest &lt; 42"), true);
  });

  it("enforces SanitizedHtml brand at compile time", () => {
    const renderPlainString = () => {
      // @ts-expect-error plain string must be rejected by SafeHtml
      return React.createElement(SafeHtml, { html: "<p>unsafe</p>" });
    };
    assert.equal(typeof renderPlainString, "function");
  });
});
