import { Router, type IRouter } from "express";

const router: IRouter = Router();

const priceRanges: Record<string, [number, number]> = {
  wedding: [50000, 200000],
  birthday: [10000, 50000],
  corporate: [20000, 80000],
  fashion: [15000, 60000],
  reel: [5000, 25000],
  drone: [8000, 40000],
};

router.post("/ai/cost-estimate", async (req, res): Promise<void> => {
  const { eventType, city, guestCount, durationHours } = req.body as {
    eventType: string; city: string; guestCount: number; durationHours: number;
  };
  const [min, max] = priceRanges[eventType.toLowerCase()] || [20000, 100000];
  const guestFactor = 1 + (guestCount / 500) * 0.3;
  const hourFactor = Math.max(1, durationHours / 4);
  const minEstimate = Math.round(min * guestFactor * hourFactor);
  const maxEstimate = Math.round(max * guestFactor * hourFactor);
  res.json({
    minEstimate, maxEstimate, averageEstimate: Math.round((minEstimate + maxEstimate) / 2),
    explanation: `Based on ${eventType} event in ${city} with ${guestCount} guests for ${durationHours} hours.`,
    recommendedPackageType: durationHours > 6 ? "Premium" : "Standard",
  });
});

router.post("/ai/package-recommendations", async (req, res): Promise<void> => {
  const { eventType, budget } = req.body as { eventType: string; budget: number; city: string; guestCount?: number };
  // Return stub packages
  res.json([
    { id: 1, photographerId: 1, name: "Essential", description: "Perfect for intimate events", price: budget * 0.5, duration: 4, includes: ["2 photographers", "200 edited photos"], addons: [], eventTypes: [eventType], isActive: true },
    { id: 2, photographerId: 1, name: "Standard", description: "Most popular choice", price: budget * 0.75, duration: 6, includes: ["2 photographers", "350 edited photos", "1 video reel"], addons: [], eventTypes: [eventType], isActive: true },
    { id: 3, photographerId: 1, name: "Premium", description: "Complete coverage", price: budget, duration: 10, includes: ["3 photographers", "500 edited photos", "full video", "drone shots", "same-day highlights"], addons: [], eventTypes: [eventType], isActive: true },
  ]);
});

router.post("/ai/caption-suggestions", async (req, res): Promise<void> => {
  const { eventType, mood, keywords } = req.body as { eventType: string; mood: string; keywords?: string[] };
  const captions = [
    `Capturing moments that last a lifetime ✨ #${eventType}Photography`,
    `Every frame tells a story. This one's yours. #${mood.charAt(0).toUpperCase() + mood.slice(1)}Moments`,
    `Where memories meet artistry. #EventShooter #${eventType}`,
    `The moments you'll want to relive forever. #ProfessionalPhotography`,
    `Through the lens, your story lives on. #${(keywords || ["memory"])[0]}`,
  ];
  res.json({ captions });
});

export default router;
