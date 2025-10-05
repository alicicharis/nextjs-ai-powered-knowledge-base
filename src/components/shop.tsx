import { db } from "@/db";
import { coinPlans } from "@/db/schema";
import { Coins } from "lucide-react";
import EmbeddedCheckoutButton from "./embedded-checkout-button";
import SectionCard from "./section-card";

export default async function Shop() {
  const coinPlansData = await db
    .select()
    .from(coinPlans)
    .orderBy(coinPlans.price);

  return (
    <SectionCard>
      <div className="flex justify-between gap-4 md:flex-row flex-col">
        {coinPlansData.map((coinPlan) => (
          <div
            key={coinPlan.id}
            className="w-full md:card bg-base-100 shadow-sm"
          >
            <div className="card-body">
              {/* <span className="badge badge-xs badge-warning">Most Popular</span> */}
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">{coinPlan.name}</h2>
                <div className="indicator font-bold">
                  <span className="mr-1 text-yellow-300 text-xl">
                    {coinPlan.amount}
                  </span>
                  <Coins className="h-5 w-5 z-10 text-yellow-300" />
                </div>
              </div>
              <EmbeddedCheckoutButton
                price={coinPlan.price}
                priceId={coinPlan.priceId}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
