"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type {
  StorefrontFooterColumnConfig,
  StorefrontFooterLinkConfig,
} from "@/shared/types";

export interface FooterColumnProps {
  column: StorefrontFooterColumnConfig & {
    links: StorefrontFooterLinkConfig[];
  };
  collapsibleOnMobile: boolean;
  headingColor: string;
  headingFontSize: number;
  textColor: string;
  fontSize: number;
}

export function FooterColumn({
  column,
  collapsibleOnMobile,
  headingColor,
  headingFontSize,
  textColor,
  fontSize,
}: FooterColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const headingStyle = {
    color: headingColor,
    fontSize: `${headingFontSize}px`,
  };

  return (
    <section>
      {collapsibleOnMobile ? (
        <>
          <h4
            className="mb-4 hidden font-bold uppercase tracking-wider md:block"
            style={headingStyle}
          >
            {column.title}
          </h4>
          <button
            type="button"
            className="flex w-full items-center justify-between border-b border-current/15 py-3 text-left font-bold uppercase tracking-wider md:hidden"
            style={headingStyle}
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={() => setIsOpen((open) => !open)}
          >
            {column.title}
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            id={contentId}
            className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out md:grid-rows-[1fr] ${
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <ul
              className="min-h-0 space-y-2.5 overflow-hidden pb-4 md:pb-0"
              style={{ color: textColor, fontSize: `${fontSize}px` }}
            >
              {column.links.map((link, index) => (
                <li key={`${link.url}-${index}`}>
                  <Link
                    href={link.url}
                    className="transition-opacity hover:opacity-70"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h4
            className="mb-4 font-bold uppercase tracking-wider"
            style={headingStyle}
          >
            {column.title}
          </h4>
          <ul
            className="space-y-2.5"
            style={{ color: textColor, fontSize: `${fontSize}px` }}
          >
            {column.links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <Link
                  href={link.url}
                  className="transition-opacity hover:opacity-70"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

