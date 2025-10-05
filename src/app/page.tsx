import MediaList from "@/components/media/media-list";
import MediaUpload from "@/components/media/media-upload";
import Nav from "@/components/nav";
import Shop from "@/components/shop";
import { getUserFiles } from "@/data/files";
import { getUserCoins } from "@/data/users";
import { getSession } from "@/lib/auth";
import { unstable_cache as nextCache } from "next/cache";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const getUserData = nextCache(
    async () => {
      return await getUserCoins(session.user.id);
    },
    [`user-${session.user.id}`],
    {
      tags: [`user-${session.user.id}`],
    }
  );

  const getFilesData = nextCache(
    async () => {
      return await getUserFiles(session.user.id);
    },
    [`files-${session.user.id}`],
    {
      tags: [`files-${session.user.id}`],
    }
  );

  const [userData, filesData] = await Promise.all([
    getUserData(),
    getFilesData(),
  ]);

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
