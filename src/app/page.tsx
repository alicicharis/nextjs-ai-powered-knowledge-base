import MediaList from "@/components/media/media-list";
import MediaUpload from "@/components/media/media-upload";
import Nav from "@/components/nav";
import Shop from "@/components/shop";
import { db } from "@/db";
import { files, users } from "@/db/schema";
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

  const filesData = await nextCache(
    async () => {
      return await db.query.files.findMany({
        where: eq(files.userId, session.user.id),
      });
    },
    [`files-${session.user.id}`],
    {
      tags: [`files-${session.user.id}`],
    }
  )();

  return (
    <main>
      <Nav coins={userData?.coins || 0} />
      <div className="grid grid-cols-12 p-4 max-w-7xl mx-auto gap-4">
        <Shop />
        <MediaUpload />
        <MediaList files={filesData || []} />
      </div>
    </main>
  );
}
