import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { githubOAuthEnabled, googleOAuthEnabled } from "@/lib/auth-options";
import { getProductsForHeader } from "@/lib/server-products";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const { products, error } = await getProductsForHeader();

  return (
    <>
      <SiteHeader products={products} error={error} />
      <AuthForm
        callbackURL="/"
        githubEnabled={githubOAuthEnabled}
        googleEnabled={googleOAuthEnabled}
        mode="signup"
      />
    </>
  );
}
