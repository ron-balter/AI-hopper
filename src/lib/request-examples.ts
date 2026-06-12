export type RequestExample = {
  title: string;
  description: string;
  rationale: string;
};

export const REQUEST_EXAMPLES: RequestExample[] = [
  {
    title: "Lightweight hiking backpack",
    description:
      "30–40L daypack with hip belt, rain cover, and room for a 2L water bladder. Under $120 if possible.",
    rationale:
      "Weekend trail hikes — need something comfortable that stays stable on steep climbs.",
  },
  {
    title: "Cast iron skillet (12 inch)",
    description:
      "Pre-seasoned or easy to season, oven-safe handle, smooth cooking surface. 10–12 inches.",
    rationale:
      "Moving into a new apartment and want one pan for stovetop-to-oven meals.",
  },
  {
    title: "Standing desk mat",
    description:
      "Anti-fatigue mat for standing desk, at least 20×32 inches, beveled edges, non-slip bottom.",
    rationale:
      "Standing 3–4 hours a day and my knees and lower back are sore on hard floor.",
  },
  {
    title: "Merino wool base layer",
    description:
      "Men's medium, long-sleeve crew, 150–200gsm, for cool-weather running. Prefer machine washable.",
    rationale:
      "Early morning runs are getting cold and cotton shirts stay damp.",
  },
  {
    title: "Ceramic pour-over coffee dripper",
    description:
      "Size #02 or similar, fits standard mugs, includes or works with paper filters.",
    rationale:
      "Want a slower weekend coffee ritual without buying another electric gadget.",
  },
  {
    title: "Blackout curtains (2 panels)",
    description:
      "84-inch length, rod pocket or grommet, true blackout (not just room darkening), neutral gray or beige.",
    rationale:
      "Streetlights outside my bedroom window make it hard to sleep before sunrise.",
  },
  {
    title: "Yoga block set (2)",
    description:
      "High-density foam, non-slip surface, standard size. Open to cork if durable.",
    rationale:
      "Tight hamstrings — need support for seated forward folds in home practice.",
  },
  {
    title: "Stainless steel water bottle",
    description:
      "32oz, wide mouth for ice, leak-proof lid, fits standard cup holders.",
    rationale:
      "Replacing plastic bottles and need something that keeps water cold on commute.",
  },
  {
    title: "Indoor herb garden kit",
    description:
      "Countertop-friendly, LED grow light included, at least basil and mint. Low maintenance.",
    rationale:
      "No outdoor space — want fresh herbs for cooking without weekly store trips.",
  },
  {
    title: "Mechanical pencil for sketching",
    description:
      "0.5mm or 0.7mm, metal body, comfortable grip, comes with spare lead.",
    rationale:
      "Urban sketching on lunch breaks — tired of cheap pencils that break constantly.",
  },
  {
    title: "Camping headlamp",
    description:
      "USB rechargeable, red night mode, at least 300 lumens, water resistant.",
    rationale:
      "Backpacking trips where I need hands-free light for cooking and tent setup.",
  },
  {
    title: "Linen sheet set (queen)",
    description:
      "Breathable linen or linen blend, fitted sheet + flat + 2 pillowcases, stone or white.",
    rationale:
      "Summer nights are too warm for polyester sheets and I run hot when sleeping.",
  },
  {
    title: "Board game for 4 players",
    description:
      "Strategy or cooperative, 60–90 minute play time, good for adults who are new to hobby games.",
    rationale:
      "Monthly game night with friends — need something deeper than party games.",
  },
  {
    title: "Running shoes (neutral cushion)",
    description:
      "Women's size 9, daily trainer for road running, ~20 miles per week, wide toe box preferred.",
    rationale:
      "Current shoes are worn out after 400 miles and my arches ache on long runs.",
  },
  {
    title: "Bamboo cutting board set",
    description:
      "Large board for vegetables plus smaller board for bread/cheese. Juice groove a plus.",
    rationale:
      "Plastic boards are scarred and smell like garlic no matter how I wash them.",
  },
  {
    title: "Travel packing cubes (set of 4)",
    description:
      "Lightweight mesh or nylon, assorted sizes, durable zippers, compressible if possible.",
    rationale:
      "Carry-on only trips — want to stop living out of a messy suitcase.",
  },
  {
    title: "Weighted blanket (15 lb)",
    description:
      "Queen size, glass beads or similar, removable washable cover, not too warm.",
    rationale:
      "Anxiety at night — heard weighted blankets help but never tried one.",
  },
  {
    title: "Kids' beginner acoustic guitar",
    description:
      "3/4 size, nylon strings, includes gig bag and tuner. Age 10 beginner.",
    rationale:
      "My kid wants to learn after school and we borrowed one that was too big.",
  },
  {
    title: "Insulated lunch bag",
    description:
      "Fits meal prep containers and a water bottle, easy-clean interior, shoulder strap optional.",
    rationale:
      "Bringing lunch to the office daily — tired of soggy sandwiches by noon.",
  },
  {
    title: "Garden kneeler with handles",
    description:
      "Foldable, thick foam pad, sturdy handles to push up from. Under 10 lbs.",
    rationale:
      "Spring planting — my knees can't handle kneeling on patio stone anymore.",
  },
];

export function pickRandomRequestExample(): RequestExample {
  const index = Math.floor(Math.random() * REQUEST_EXAMPLES.length);
  return REQUEST_EXAMPLES[index]!;
}
