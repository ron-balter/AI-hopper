import Image from "next/image";

import {
  MARKETPLACE_LABELS,
  MARKETPLACE_LOGOS,
  parseMarketplace,
} from "~/lib/marketplaces";

export function MarketplaceLogo({
  marketplace,
  className = "h-8 w-8 shrink-0",
}: {
  marketplace: string;
  className?: string;
}) {
  const source = parseMarketplace(marketplace);

  return (
    <span
      className={`relative inline-flex overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 ${className}`}
      title={MARKETPLACE_LABELS[source]}
    >
      <Image
        src={MARKETPLACE_LOGOS[source]}
        alt={MARKETPLACE_LABELS[source]}
        fill
        sizes="36px"
        className="object-contain p-0.5"
      />
    </span>
  );
}
