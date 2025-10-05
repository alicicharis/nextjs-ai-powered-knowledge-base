import Nav from "@/components/nav";
import Shop from "@/components/shop";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { unstable_cache as nextCache } from "next/cache";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userData = await nextCache(
    async () => {
      return await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { coins: true },
      });
    },
    [`user-${session.user.id}`],
    {
      tags: [`user-${session.user.id}`],
    }
  )();

  return (
    <main>
      <Nav coins={userData?.coins || 0} />
      <div className="grid grid-cols-12 p-4 max-w-7xl mx-auto">
        {/* <FileUpload /> */}
        <Shop />
      </div>
    </main>
  );
}
