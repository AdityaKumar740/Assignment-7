import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getProductsForHeader } from "@/lib/server-products";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/signin?callbackURL=%2Fprofile");
  }

  const { products, error } = await getProductsForHeader();
  const joinedAt = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(session.user.createdAt));

  return (
    <>
      <SiteHeader products={products} error={error} />
      <main className="profile-page">
        <div className="profile-heading">
          <span aria-hidden="true" className="profile-avatar">
            {Array.from(session.user.name || session.user.email)[0] ?? "👤"}
          </span>
          <div>
            <p className="profile-eyebrow">আপনার অ্যাকাউন্ট</p>
            <h1>আমার প্রোফাইল</h1>
          </div>
        </div>
        <section aria-label="প্রোফাইলের তথ্য" className="profile-card">
          <div className="profile-info-row">
            <span>নাম</span>
            <strong>{session.user.name || "নাম যোগ করা হয়নি"}</strong>
          </div>
          <div className="profile-info-row">
            <span>ইমেইল</span>
            <strong>{session.user.email}</strong>
          </div>
          <div className="profile-info-row">
            <span>অ্যাকাউন্ট তৈরি</span>
            <strong>{joinedAt}</strong>
          </div>
        </section>
      </main>
    </>
  );
}
