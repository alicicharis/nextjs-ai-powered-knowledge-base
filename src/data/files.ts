"use server";

import { db } from "@/db";
import { files } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const getUserFiles = async (userId: string) => {
  return await db.query.files.findMany({
    where: eq(files.userId, userId),
  });
};

export const createUserFile = async (
  key: string,
  type: string,
  fileName: string
) => {
  const session = await getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  await db.insert(files).values({
    id: key,
    userId: session.user.id,
    type,
    name: fileName,
  });

  revalidateTag(`files-${session.user.id}`);
};
