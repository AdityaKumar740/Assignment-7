import { Suspense } from "react";
import { AuthForm, AuthPageSkeleton } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { githubOAuthEnabled, googleOAuthEnabled } from "@/lib/auth-options";
import { getHeaderData } from "@/lib/server-products";

type SignInPageProps = {
  searchParams: Promise<{
    callbackURL?: string;
    registered?: string;
    notice?: string;
  }>;
};

function getSafeCallbackURL(callbackURL?: string) {
  if (
    !callbackURL ||
    !callbackURL.startsWith("/") ||
    callbackURL.startsWith("//") ||
    callbackURL.includes("\\")
  ) {
    return "/";
  }

  const safeOrigin = "https://bazardor.invalid";
  const destination = new URL(callbackURL, safeOrigin);
  return destination.origin === safeOrigin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ callbackURL, registered, notice }, headerData] = await Promise.all([
    searchParams,
    getHeaderData(),
  ]);

  return (
    <>
      <SiteHeader {...headerData} />
      <Suspense fallback={<AuthPageSkeleton mode="signin" />}>
        <AuthForm
          callbackURL={getSafeCallbackURL(callbackURL)}
          githubEnabled={githubOAuthEnabled}
          googleEnabled={googleOAuthEnabled}
          mode="signin"
          protectedRouteNotice={notice === "protected-route"}
          registered={registered === "1"}
        />
      </Suspense>
    </>
  );
}
