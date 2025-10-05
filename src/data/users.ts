"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const getUserCoins = async (userId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { coins: true },
  });
};

export const updateUserCoins = async (amount: number) => {
  const session = await getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const userData = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const newCoins = userData.coins + amount;

  await db
    .update(users)
    .set({ coins: newCoins })
    .where(eq(users.id, session.user.id));

  revalidateTag(`user-${session.user.id}`);

  return newCoins;
};
