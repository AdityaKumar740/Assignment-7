"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/toast-provider";

type AuthMode = "signin" | "signup";
type SocialProvider = "google" | "github";

export function AuthPageSkeleton({ mode }: { mode: AuthMode }) {
  return (
    <main aria-busy="true" aria-label="অ্যাকাউন্ট পৃষ্ঠা লোড হচ্ছে" className="mx-auto my-12 w-[min(100%-32px,440px)]">
      <div className="mb-[22px] text-center">
        <span className="skeleton-block mx-auto mb-3 block h-7 w-[190px] rounded" />
        <span className="skeleton-block mx-auto block h-3 w-[min(100%,300px)] rounded" />
      </div>
      <section className="grid gap-[11px] rounded-2xl border border-[#e4ebe5] bg-white p-6 shadow-[0_12px_35px_rgb(35_65_43_/_7%)]">
        <span className="skeleton-block h-3 w-16 rounded" />
        {mode === "signup" && (
          <span className="skeleton-block mb-1 h-[45px] w-full rounded-lg" />
        )}
        <span className="skeleton-block h-3 w-16 rounded" />
        <span className="skeleton-block mb-1 h-[45px] w-full rounded-lg" />
        <span className="skeleton-block h-3 w-16 rounded" />
        <span className="skeleton-block mb-1 h-[45px] w-full rounded-lg" />
        <span className="skeleton-block mt-1 h-[45px] w-full rounded-lg" />
        <span className="skeleton-block mt-2 h-[42px] w-full rounded-lg" />
      </section>
    </main>
  );
}

export function AuthForm({
  mode,
  callbackURL = "/",
  googleEnabled,
  githubEnabled,
  registered = false,
}: {
  mode: AuthMode;
  callbackURL?: string;
  googleEnabled: boolean;
  githubEnabled: boolean;
  registered?: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const { data: session, isPending } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    registered ? "অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।" : null,
  );
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!isPending && session) {
      router.replace(callbackURL);
    }
  }, [callbackURL, isPending, router, session]);

  useEffect(() => {
    if (registered) {
      showToast("অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।", "success");
    }
  }, [registered, showToast]);

  if (isPending || session) {
    return <AuthPageSkeleton mode={mode} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignup) {
        const name = String(formData.get("name") ?? "").trim();
        await authClient.signUp.email(
          {
            name,
            email,
            password,
          },
          {
            onRequest: () => setIsSubmitting(true),
            onSuccess: () => {
              showToast("অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।", "success");
              router.push("/signin?registered=1");
              router.refresh();
            },
            onError: ({ error }) => {
              const errorMessage =
                error.message || "অ্যাকাউন্ট তৈরি করা যায়নি।";
              setMessage(errorMessage);
              showToast(errorMessage, "error");
            },
          },
        );
        return;
      }

      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL,
      });

      if (result.error) {
        throw new Error(result.error.message || "সাইন ইন করা যায়নি।");
      }

      showToast("সফলভাবে সাইন ইন হয়েছে।", "success");
      router.replace(callbackURL);
      router.refresh();
    } catch (authError) {
      const errorMessage =
        authError instanceof Error
          ? authError.message
          : "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    const isConfigured =
      provider === "google" ? googleEnabled : githubEnabled;
    if (!isConfigured) {
      const providerName = provider === "google" ? "Google" : "GitHub";
      const errorMessage = `${providerName} লগইনের জন্য সার্ভারে OAuth credentials কনফিগার করা নেই।`;
      setMessage(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL,
      });
      if (result.error) {
        throw new Error(result.error.message || "সোশ্যাল লগইন করা যায়নি।");
      }
    } catch (authError) {
      const errorMessage =
        authError instanceof Error
          ? authError.message
          : "সোশ্যাল লগইন করা যায়নি। আবার চেষ্টা করুন।";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto my-12 w-[min(100%-32px,440px)] max-[600px]:my-8">
      <div className="mb-[22px] text-center">
        <h1 className="m-0 text-[28px] font-extrabold text-[#20372a]">{isSignup ? "অ্যাকাউন্ট তৈরি করুন" : "সাইন ইন"}</h1>
        <p className="mt-2 text-[13px] leading-[1.7] text-[#6a766e]">
          {isSignup
            ? "বাজার দর ও প্রতিদিনের দামের আপডেট পেতে অ্যাকাউন্ট খুলুন।"
            : "বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে প্রবেশ করুন।"}
        </p>
      </div>

      <section aria-label={isSignup ? "নিবন্ধন ফর্ম" : "সাইন ইন ফর্ম"} className="rounded-2xl border border-[#e4ebe5] bg-white p-6 shadow-[0_12px_35px_rgb(35_65_43_/_7%)] max-[600px]:px-4 max-[600px]:py-5">
        {message && (
          <p className="mb-4 rounded-lg border border-[#f2c8c4] bg-[#fff5f4] px-3 py-2.5 text-xs leading-relaxed text-[#a22d25]" role="alert">
            {message}
          </p>
        )}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="grid gap-1.5 text-[13px] font-semibold text-[#34443a]">
              <span>নাম</span>
              <input
                autoComplete="name"
                className="min-h-[45px] w-full rounded-lg border border-[#dce5de] bg-white px-3 py-2.5 text-[13px] text-[#202925] outline-none placeholder:text-[#9aa49d] focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
                name="name"
                placeholder="যেমন: রহিম উদ্দিন"
                required
                type="text"
              />
            </label>
          )}
          <label className="grid gap-1.5 text-[13px] font-semibold text-[#34443a]">
            <span>ইমেইল</span>
            <input
              autoComplete="email"
              className="min-h-[45px] w-full rounded-lg border border-[#dce5de] bg-white px-3 py-2.5 text-[13px] text-[#202925] outline-none placeholder:text-[#9aa49d] focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>
          <label className="grid gap-1.5 text-[13px] font-semibold text-[#34443a]">
            <span>পাসওয়ার্ড</span>
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="min-h-[45px] w-full rounded-lg border border-[#dce5de] bg-white px-3 py-2.5 text-[13px] text-[#202925] outline-none placeholder:text-[#9aa49d] focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
              minLength={8}
              name="password"
              placeholder="কমপক্ষে ৮ অক্ষর"
              required
              type="password"
            />
          </label>
          <button
            className="mt-1 min-h-[45px] rounded-lg bg-[#078641] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#066f36] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "অপেক্ষা করুন…"
              : isSignup
                ? "অ্যাকাউন্ট তৈরি করুন"
                : "সাইন ইন"}
          </button>
        </form>

        <div aria-hidden="true" className="my-5 flex items-center gap-3 text-[11px] text-[#7b857e]">
          <span className="h-px flex-1 bg-[#e7ece8]" />
          <span>অথবা</span>
          <span className="h-px flex-1 bg-[#e7ece8]" />
        </div>

        <div className="grid gap-2">
          <button
            className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[#dfe6e0] bg-white text-xs font-semibold text-[#34443a] hover:bg-[#f8faf8] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => void handleSocialSignIn("google")}
            type="button"
          >
            <span aria-hidden="true" className="text-base font-extrabold text-[#4285f4]">
              G
            </span>
            Google দিয়ে চালিয়ে যান
          </button>
          <button
            className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-[#dfe6e0] bg-white text-xs font-semibold text-[#34443a] hover:bg-[#f8faf8] disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => void handleSocialSignIn("github")}
            type="button"
          >
            <span aria-hidden="true" className="text-base text-[#252a27]">
              ◉
            </span>
            GitHub দিয়ে চালিয়ে যান
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-[#69756d]">
          {isSignup ? "অ্যাকাউন্ট আছে?" : "অ্যাকাউন্ট নেই?"}{" "}
          <Link className="font-bold text-[#066f36] hover:underline" href={isSignup ? "/signin" : "/signup"}>
            {isSignup ? "সাইন ইন করুন" : "নিবন্ধন করুন"}
          </Link>
        </p>
      </section>

      <Link className="mx-auto mt-5 block w-fit text-xs text-[#59675e] hover:text-[#078641]" href="/">
        ← হোম পেজে ফিরে যান
      </Link>
    </main>
  );
}
