import SectionCard from "@/components/section-card";
import { stripe } from "@/lib/stripe";
import Link from "next/link";

async function getStripeSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

export default async function CheckoutReturn({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const params = await searchParams;

  const sessionId = params.session_id;
  const session = await getStripeSession(sessionId);

  if (session?.status === "open") {
    return <p>Payment did not work.</p>;
  }

  if (session?.status === "complete") {
    return (
      <main>
        <div className="p-4 max-w-7xl mx-auto">
          <SectionCard>
            <div className="flex flex-col gap-4">
              <h3>We appreciate your business!</h3>
              <Link href="/">Go to home</Link>
            </div>
          </SectionCard>
        </div>
      </main>
    );
  }

  return null;
}
