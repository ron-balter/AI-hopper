export type Marketplace = "AMAZON" | "ALIEXPRESS";

export type CartAction = {
  url: string;
  buttonLabel: string;
  hint: string;
};

const AMAZON_ASIN_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /[?&]asin=([A-Z0-9]{10})/i,
];

export function extractAmazonAsin(productUrl: string): string | null {
  for (const pattern of AMAZON_ASIN_PATTERNS) {
    const match = productUrl.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return null;
}

export function extractAliExpressProductId(productUrl: string): string | null {
  const match = productUrl.match(/\/item\/(\d+)\.html/i);
  return match?.[1] ?? null;
}

export function buildCartAction(
  source: Marketplace,
  productUrl: string,
): CartAction {
  if (source === "AMAZON") {
    const asin = extractAmazonAsin(productUrl);
    if (asin) {
      let host = "www.amazon.com";
      try {
        host = new URL(productUrl).host;
      } catch {
        // keep default
      }
      return {
        url: `https://${host}/gp/aws/cart/add.html?ASIN.1=${encodeURIComponent(asin)}&Quantity.1=1`,
        buttonLabel: "Add to Amazon cart",
        hint: "Opens Amazon to confirm adding this item to your cart.",
      };
    }
    return {
      url: productUrl,
      buttonLabel: "View on Amazon",
      hint: "Could not parse ASIN — opens the product listing.",
    };
  }

  const productId = extractAliExpressProductId(productUrl);
  const listingUrl = productId
    ? `https://www.aliexpress.com/item/${productId}.html`
    : productUrl;

  return {
    url: listingUrl,
    buttonLabel: "Add to AliExpress bag",
    hint: "Opens AliExpress — sign in and tap Add to Bag on the product page.",
  };
}

export function openCartAction(action: CartAction) {
  window.open(action.url, "_blank", "noopener,noreferrer");
}
