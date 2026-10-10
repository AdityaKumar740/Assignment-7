import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { githubOAuthEnabled, googleOAuthEnabled } from "@/lib/auth-options";
import { getHeaderData } from "@/lib/server-products";

export default async function SignUpPage() {
  const headerData = await getHeaderData();

  return (
    <>
      <SiteHeader {...headerData} />
      <AuthForm
        callbackURL="/"
        githubEnabled={githubOAuthEnabled}
        googleEnabled={googleOAuthEnabled}
        mode="signup"
      />
    </>
  );
}
