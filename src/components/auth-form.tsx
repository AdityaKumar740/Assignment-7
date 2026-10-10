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
    <main aria-busy="true" aria-label="অ্যাকাউন্ট পৃষ্ঠা লোড হচ্ছে" className="auth-page">
      <div className="auth-heading">
        <span className="skeleton-block auth-skeleton-title" />
        <span className="skeleton-block auth-skeleton-subtitle" />
      </div>
      <section className="auth-card auth-skeleton-card">
        <span className="skeleton-block auth-skeleton-label" />
        {mode === "signup" && (
          <span className="skeleton-block auth-skeleton-input" />
        )}
        <span className="skeleton-block auth-skeleton-label" />
        <span className="skeleton-block auth-skeleton-input" />
        <span className="skeleton-block auth-skeleton-label" />
        <span className="skeleton-block auth-skeleton-input" />
        <span className="skeleton-block auth-skeleton-submit" />
        <span className="skeleton-block auth-skeleton-social" />
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
    <main className="auth-page">
      <div className="auth-heading">
        <h1>{isSignup ? "অ্যাকাউন্ট তৈরি করুন" : "সাইন ইন"}</h1>
        <p>
          {isSignup
            ? "বাজার দর ও প্রতিদিনের দামের আপডেট পেতে অ্যাকাউন্ট খুলুন।"
            : "বিস্তারিত দাম, বাজার তুলনা ও প্রোফাইল দেখতে অ্যাকাউন্টে প্রবেশ করুন।"}
        </p>
      </div>

      <section aria-label={isSignup ? "নিবন্ধন ফর্ম" : "সাইন ইন ফর্ম"} className="auth-card">
        {message && (
          <p className="auth-form-message" role="alert">
            {message}
          </p>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>নাম</span>
              <input
                autoComplete="name"
                name="name"
                placeholder="যেমন: রহিম উদ্দিন"
                required
                type="text"
              />
            </label>
          )}
          <label className="auth-field">
            <span>ইমেইল</span>
            <input
              autoComplete="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>
          <label className="auth-field">
            <span>পাসওয়ার্ড</span>
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              name="password"
              placeholder="কমপক্ষে ৮ অক্ষর"
              required
              type="password"
            />
          </label>
          <button
            className="auth-submit"
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

        <div aria-hidden="true" className="auth-divider">
          <span />
          <span>অথবা</span>
          <span />
        </div>

        <div className="social-auth-actions">
          <button
            className="social-auth-button"
            disabled={isSubmitting}
            onClick={() => void handleSocialSignIn("google")}
            type="button"
          >
            <span aria-hidden="true" className="google-mark">
              G
            </span>
            Google দিয়ে চালিয়ে যান
          </button>
          <button
            className="social-auth-button"
            disabled={isSubmitting}
            onClick={() => void handleSocialSignIn("github")}
            type="button"
          >
            <span aria-hidden="true" className="github-mark">
              ◉
            </span>
            GitHub দিয়ে চালিয়ে যান
          </button>
        </div>

        <p className="auth-switch-link">
          {isSignup ? "অ্যাকাউন্ট আছে?" : "অ্যাকাউন্ট নেই?"}{" "}
          <Link href={isSignup ? "/signin" : "/signup"}>
            {isSignup ? "সাইন ইন করুন" : "নিবন্ধন করুন"}
          </Link>
        </p>
      </section>

      <Link className="auth-home-link" href="/">
        ← হোম পেজে ফিরে যান
      </Link>
    </main>
  );
}
