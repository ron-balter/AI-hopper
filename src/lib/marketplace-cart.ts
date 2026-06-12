import {
  type Marketplace,
  MARKETPLACE_LABELS,
  parseMarketplace,
} from "~/lib/marketplaces";

export type { Marketplace };

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

function firstCapture(pattern: RegExp, value: string): string | null {
  const match = pattern.exec(value);
  return match?.[1] ?? null;
}

export function extractAmazonAsin(productUrl: string): string | null {
  for (const pattern of AMAZON_ASIN_PATTERNS) {
    const asin = firstCapture(pattern, productUrl);
    if (asin) return asin.toUpperCase();
  }
  return null;
}

const ALIEXPRESS_ITEM_PATTERN = /\/item\/(\d+)\.html/i;
const EBAY_ITEM_PATTERN = /\/itm\/(?:[^/]+\/)?(\d{10,})(?:[/?]|$)/i;

export function extractAliExpressProductId(productUrl: string): string | null {
  return firstCapture(ALIEXPRESS_ITEM_PATTERN, productUrl);
}

export function extractEbayItemId(productUrl: string): string | null {
  return firstCapture(EBAY_ITEM_PATTERN, productUrl);
}

function listingAction(
  source: Marketplace,
  productUrl: string,
  hint: string,
): CartAction {
  return {
    url: productUrl,
    buttonLabel: `View on ${MARKETPLACE_LABELS[source]}`,
    hint,
  };
}

export function buildCartAction(
  source: string,
  productUrl: string,
): CartAction {
  const marketplace = parseMarketplace(source);

  if (marketplace === "AMAZON") {
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
    return listingAction(
      marketplace,
      productUrl,
      "Could not parse ASIN — opens the product listing.",
    );
  }

  if (marketplace === "ALIEXPRESS") {
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

  if (marketplace === "EBAY") {
    const itemId = extractEbayItemId(productUrl);
    if (itemId) {
      let host = "www.ebay.com";
      try {
        host = new URL(productUrl).host;
      } catch {
        // keep default
      }
      return {
        url: `https://${host}/cart/add?item=${encodeURIComponent(itemId)}&quantity=1`,
        buttonLabel: "Add to eBay cart",
        hint: "Opens eBay to add this listing to your cart.",
      };
    }
    return listingAction(
      marketplace,
      productUrl,
      "Opens the eBay listing — add to cart from the item page.",
    );
  }

  return listingAction(
    marketplace,
    productUrl,
    "Opens the Shopify store product page — use Add to cart on the store.",
  );
}

export function openCartAction(action: CartAction) {
  window.open(action.url, "_blank", "noopener,noreferrer");
}
