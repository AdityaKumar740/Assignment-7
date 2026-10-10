"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useToast } from "@/components/toast-provider";
import { authClient } from "@/lib/auth-client";

export function ProfileSettings({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function updateName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedName = String(formData.get("name") ?? "").trim();
    if (!updatedName) {
      setFormError("আপনার নাম লিখুন।");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const result = await authClient.updateUser({ name: updatedName });
      if (result.error) {
        throw new Error(result.error.message || "নাম আপডেট করা যায়নি।");
      }
      showToast("প্রোফাইলের নাম আপডেট হয়েছে।", "success");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "নাম আপডেট করা যায়নি। আবার চেষ্টা করুন।";
      setFormError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function signOut() {
    setIsSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message || "সাইন আউট করা যায়নি।");
      }
      showToast("সফলভাবে সাইন আউট হয়েছে।", "success");
      router.replace("/");
      router.refresh();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "সাইন আউট করা যায়নি। আবার চেষ্টা করুন।",
        "error",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="space-y-4">
      <section
        aria-label="প্রোফাইল পরিচিতি"
        className="flex min-h-[94px] items-center justify-between gap-4 rounded-xl border border-[#e4ebe5] bg-white px-5 py-4 max-[520px]:items-start max-[520px]:px-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-xl bg-[#f0f3f1] text-2xl font-bold text-[#078641]"
          >
            {Array.from(name || email)[0] ?? "👤"}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <strong className="truncate text-base font-semibold text-[#29372e]">
              {name || "নাম যোগ করা হয়নি"}
            </strong>
            <span className="break-all text-[13px] text-[#77817b]">
              {email}
            </span>
          </div>
        </div>
        <button
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#e98b84] px-3 py-2 text-xs font-medium text-[#cf5148] transition hover:bg-[#fff3f1] disabled:cursor-wait disabled:opacity-60 max-[520px]:text-[10px]"
          disabled={isSigningOut}
          onClick={() => void signOut()}
          type="button"
        >
          <span aria-hidden="true">↪</span>
          {isSigningOut ? "অপেক্ষা করুন…" : "সাইন আউট"}
        </button>
      </section>

      <section
        aria-labelledby="profile-info-title"
        className="rounded-xl border border-[#e4ebe5] bg-white p-5 sm:p-6"
      >
        <h2
          className="mb-6 mt-0 text-sm font-bold text-[#46534a]"
          id="profile-info-title"
        >
          তথ্য
        </h2>
        <form className="grid gap-3" onSubmit={updateName}>
          <label
            className="grid gap-2 text-xs font-medium text-[#59665e]"
            htmlFor="profile-name"
          >
            নাম
            <input
              autoComplete="name"
              className="min-h-[42px] w-full rounded-lg border border-[#e0e7e1] bg-white px-3 text-sm text-[#29372e] outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
              defaultValue={name}
              id="profile-name"
              maxLength={100}
              name="name"
              required
            />
          </label>
          {formError && (
            <p
              className="m-0 rounded-lg border border-[#f2c8c4] bg-[#fff5f4] px-3 py-2 text-xs text-[#a22d25]"
              role="alert"
            >
              {formError}
            </p>
          )}
          <button
            className="mt-0.5 min-h-[40px] rounded-lg bg-[#078641] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#066f36] disabled:cursor-wait disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "আপডেট হচ্ছে…" : "আপডেট"}
          </button>
        </form>
      </section>
    </div>
  );
}
