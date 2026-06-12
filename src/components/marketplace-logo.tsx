import type { ReactElement } from "react";

import {
  type Marketplace,
  parseMarketplace,
} from "~/lib/marketplaces";

function AmazonLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
      <rect width="24" height="24" rx="5" fill="#FF9900" />
      <path
        fill="#131921"
        d="M16.2 13.8c-3.1 2.3-7.6 3.5-11.5 3.5-.7 0-.7-1 0-1.1 4-.5 8.4-2.2 11.3-4.5.5-.4 1 .3.2.6v1.5z"
      />
      <path
        fill="#131921"
        d="M13.8 7.2c0 .6-.5 1-1 1.1-1.2.2-2.5.3-3.8.3-.4 0-.4-.6 0-.7 1.1-.1 2.3-.3 3.4-.6.6-.2 1.4.1 1.4.9z"
      />
    </svg>
  );
}

function AliExpressLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
      <rect width="24" height="24" rx="5" fill="#E62E04" />
      <path
        fill="#fff"
        d="M6.5 7h3.2l1.1 5.2L12 7h3l-2.2 10h-2.4L6.5 7zm8.2 0h2.8c1.6 0 2.5.8 2.5 2.1 0 1.8-1.2 2.8-3.2 2.8h-.8L15 17h-2.3l1.5-7.2zm.9 3.4h.5c.8 0 1.2-.3 1.2-.9 0-.5-.3-.8-.9-.8h-.5l-.4 1.7z"
      />
    </svg>
  );
}

function EbayLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
      <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" />
      <path fill="#E53238" d="M5 8h2.8l1 5.5.9-5.5H12l-1.6 10H8.2L5 8z" />
      <path fill="#0064D2" d="M12.5 8H15l1.2 6.2L17.8 8H20l-2.2 10h-2.1l-1.4-6.5L13 18h-2.1l1.6-10z" />
      <path fill="#F5AF02" d="M9.2 15.5h5.6l.4 2.5H8.8l.4-2.5z" />
      <path fill="#86B817" d="M10.5 13h3l.3 1.8h-3.6L10.5 13z" />
    </svg>
  );
}

function ShopifyLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
      <rect width="24" height="24" rx="5" fill="#95BF47" />
      <path
        fill="#fff"
        d="M14.8 6.2c-.1-.8-.8-1.2-1.5-1.2-.9 0-2 .3-2 .3s-.4-.4-1-.4-1.2.5-1.5 1.1c-.9.3-1.5.5-1.5.5v.2s1.6.1 2.5 1.4c.5-.1 1-.1 1.4 0 .8-1.2 2.3-1.4 2.5-1.4v-.2s-.5-.2-1.4-.5c-.2-.5-.5-.8-.5-.8zm-2.2 2.1c-.3 0-.6.1-.9.2-.4-1-1.4-1.3-1.4-1.3s.5 1.5 1.8 1.8c.3-.6.5-1 .5-1.7zm3.8 9.2h-8.9c-.4 0-.7-.3-.7-.7V9.8l9.6 1.1v6.9c0 .4-.3.7-.7.7z"
      />
    </svg>
  );
}

const LOGOS: Record<Marketplace, () => ReactElement> = {
  AMAZON: AmazonLogo,
  ALIEXPRESS: AliExpressLogo,
  EBAY: EbayLogo,
  SHOPIFY: ShopifyLogo,
};

export function MarketplaceLogo({
  marketplace,
  className = "h-8 w-8 shrink-0",
}: {
  marketplace: string;
  className?: string;
}) {
  const Logo = LOGOS[parseMarketplace(marketplace)];
  return (
    <span
      className={`inline-flex overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5 ${className}`}
      title={parseMarketplace(marketplace)}
    >
      <Logo />
    </span>
  );
}
