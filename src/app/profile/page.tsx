import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/profile-settings";
import { SiteHeader } from "@/components/site-header";
import { getProductsForHeader } from "@/lib/server-products";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/signin?callbackURL=%2Fprofile&notice=protected-route");
  }

  const { products, error } = await getProductsForHeader();

  return (
    <>
      <SiteHeader products={products} error={error} />
      <main className="min-h-[calc(100vh-150px)] bg-[#f1f6f2] px-4 pb-12 pt-20 max-[600px]:pt-12">
        <div className="mx-auto w-full max-w-[576px]">
          <header className="mb-5">
            <h1 className="m-0 text-[20px] font-bold text-[#29372e]">
              আমার প্রোফাইল
            </h1>
            <p className="mb-0 mt-1 text-[11px] text-[#7a847e]">
              আপনার অ্যাকাউন্টের তথ্য এখানে দেখুন।
            </p>
          </header>
          <ProfileSettings
            email={session.user.email}
            name={session.user.name || ""}
          />
        </div>
      </main>
    </>
  );
}
