import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
  await db.notification.deleteMany();
  await db.agentEvent.deleteMany();
  await db.productCandidate.deleteMany();
  await db.productRequest.deleteMany();

  const request = await db.productRequest.create({
    data: {
      title: "USB-C hub with 4K HDMI",
      description:
        "Compact travel hub with 4K HDMI, 100W pass-through charging, and at least 2 USB-A ports.",
      rationale:
        "I travel for work and need one adapter for hotel monitors and charging my laptop.",
      status: "READY_FOR_REVIEW",
      agentId: "agent-demo-seed0001",
      comparisonAgentId: "agent-compare-demo-seed",
      lastRunId: "demo-run-seed",
      lastRequestId: "req-demo-seed",
      durationMs: 12000,
      comparisonStatus: "READY",
      comparisonSummary:
        "Anker 555 is the best balance of reliability and travel size. Baseus is the budget pick.",
      candidates: {
        create: [
          {
            source: "AMAZON",
            title: "Anker 555 USB-C Hub (8-in-1)",
            url: "https://www.amazon.com/dp/B09JQ5K4BP",
            price: "49.99",
            currency: "USD",
            rating: 4.6,
            reviewCount: 12400,
            reviewSummary:
              "Reliable travel hub with 4K HDMI and 100W pass-through charging.",
            pros: "Compact, stable HDMI, trusted brand",
            cons: "Runs warm under load",
            rank: 1,
          },
          {
            source: "AMAZON",
            title: "UGREEN Revodok Pro 209 USB-C Hub",
            url: "https://www.amazon.com/dp/B0BHNWD9B5",
            price: "39.99",
            currency: "USD",
            rating: 4.5,
            reviewCount: 3200,
            reviewSummary: "Strong value with dual HDMI and ethernet.",
            pros: "Dual display, ethernet",
            cons: "Larger form factor",
            rank: 2,
          },
          {
            source: "ALIEXPRESS",
            title: "Baseus 8-in-1 USB-C Hub Adapter",
            url: "https://www.aliexpress.com/item/1005005123456789.html",
            price: "22.99",
            currency: "USD",
            rating: 4.7,
            reviewCount: 890,
            reviewSummary: "Budget-friendly with solid reviews for basic travel use.",
            pros: "Low price, many ports",
            cons: "Longer shipping",
            rank: 3,
          },
        ],
      },
      notifications: {
        createMany: {
          data: [
            {
              type: "CANDIDATES_READY",
              message: "3 candidates ready for your USB-C hub search.",
              read: true,
            },
            {
              type: "COMPARISON_READY",
              message:
                "Anker 555 is the best balance of reliability and travel size. Baseus is the budget pick.",
              read: false,
            },
          ],
        },
      },
    },
    include: { candidates: true },
  });

  const specs = ["Price", "Rating", "Reviews", "4K HDMI", "USB-A ports", "Best for"];
  const values = [
    {
      Price: "$49.99",
      Rating: "4.6 ★",
      Reviews: "12,400",
      "4K HDMI": "Yes @ 60Hz",
      "USB-A ports": "2",
      "Best for": "Travel, reliability",
    },
    {
      Price: "$39.99",
      Rating: "4.5 ★",
      Reviews: "3,200",
      "4K HDMI": "Dual display",
      "USB-A ports": "2",
      "Best for": "Desk + travel",
    },
    {
      Price: "$22.99",
      Rating: "4.7 ★",
      Reviews: "890",
      "4K HDMI": "Yes @ 30Hz",
      "USB-A ports": "3",
      "Best for": "Budget travel",
    },
  ];

  await db.productRequest.update({
    where: { id: request.id },
    data: {
      comparisonTableJson: JSON.stringify({
        specs,
        rows: request.candidates.map((c, i) => ({
          candidateId: c.id,
          title: c.title,
          source: c.source,
          values: values[i],
        })),
        summary: request.comparisonSummary,
      }),
    },
  });

  console.log(`Seeded product request: ${request.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void db.$disconnect());
