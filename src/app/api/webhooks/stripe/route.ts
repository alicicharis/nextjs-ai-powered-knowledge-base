import { db } from "@/db";
import { users } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      await updateUsersCoins(
        session.amount_total as number,
        session.metadata?.userId
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Unexpected error in webhook handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const updateUsersCoins = async (amount: number, userId?: string) => {
  if (!userId) {
    console.error("No user ID provided in webhook metadata");
    return null;
  }

  const currentUser = await db
    .select({ coins: users.coins })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (currentUser.length === 0) {
    console.error("User not found with ID: ", userId);
    return null;
  }

  const currentCoins = currentUser[0].coins;
  const coins = getCoins(amount);
  const newCoins = currentCoins + coins;

  await db.update(users).set({ coins: newCoins }).where(eq(users.id, userId));

  revalidateTag(`user-${userId}`);

  return newCoins;
};

const getCoins = (amount: number) => {
  switch (amount) {
    case 500:
      return 50;
    case 1000:
      return 200;
    case 2000:
      return 500;
    default:
      return 0;
  }
};
