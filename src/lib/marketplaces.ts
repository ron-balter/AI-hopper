export const MARKETPLACES = [
  "AMAZON",
  "ALIEXPRESS",
  "EBAY",
  "SHOPIFY",
] as const;

export type Marketplace = (typeof MARKETPLACES)[number];

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  AMAZON: "Amazon",
  ALIEXPRESS: "AliExpress",
  EBAY: "eBay",
  SHOPIFY: "Shopify",
};

export const MARKETPLACE_AGENTS: Record<Marketplace, string> = {
  AMAZON: "amazon-researcher",
  ALIEXPRESS: "aliexpress-researcher",
  EBAY: "ebay-researcher",
  SHOPIFY: "shopify-researcher",
};

export const MARKETPLACE_LOGOS: Record<Marketplace, string> = {
  AMAZON: "/amazon_logo.png",
  ALIEXPRESS: "/aliexpress-logo.png",
  EBAY: "/ebay-logo.png",
  SHOPIFY: "/shopify_logo.png",
};

export const MARKETPLACE_BADGE_CLASS: Record<Marketplace, string> = {
  AMAZON: "bg-orange-100 text-orange-800",
  ALIEXPRESS: "bg-red-100 text-red-800",
  EBAY: "bg-yellow-100 text-yellow-900",
  SHOPIFY: "bg-emerald-100 text-emerald-800",
};

export function parseMarketplace(value: string): Marketplace {
  const upper = value.toUpperCase();
  if ((MARKETPLACES as readonly string[]).includes(upper)) {
    return upper as Marketplace;
  }
  return "AMAZON";
}

export function marketplaceLabel(source: string): string {
  return MARKETPLACE_LABELS[parseMarketplace(source)];
}

export function inferMarketplaceFromUrl(url: string): Marketplace | null {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.toLowerCase();

    if (host.includes("amazon.")) return "AMAZON";
    if (host.includes("aliexpress.")) return "ALIEXPRESS";
    if (host.includes("ebay.")) return "EBAY";
    if (host.includes("myshopify.com") || pathname.includes("/products/")) {
      return "SHOPIFY";
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveMarketplace(source: string, url: string): Marketplace {
  return inferMarketplaceFromUrl(url) ?? parseMarketplace(source);
}
