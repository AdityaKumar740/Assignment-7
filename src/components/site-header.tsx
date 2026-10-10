"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { authClient } from "@/lib/auth-client";
import logoIcon from "@/assets/logo-icon.png";
import {
  categories,
  formatBengaliNumber,
  unitNames,
  type Product,
} from "@/lib/products";

function PriceItem({ product }: { product: Product }) {
  const changeIcon =
    product.change.dir === "up"
      ? "▲"
      : product.change.dir === "down"
        ? "▼"
        : "•";
  const changeClass =
    product.change.dir === "up"
      ? "text-[#94efad]"
      : product.change.dir === "down"
        ? "text-[#ffb9b1]"
        : "text-[#d0d9d2]";

  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 px-4 text-[11px] text-white sm:text-xs">
      <span aria-hidden="true">{product.categoryIcon}</span>
      <span className="font-semibold">{product.nameBn}</span>
      <span>
        {formatBengaliNumber(product.today)} টাকা/
        {unitNames[product.unit] ?? product.unit}
      </span>
      <span className={`font-semibold ${changeClass}`}>
        {changeIcon} {formatBengaliNumber(Math.abs(product.change.pct))}%
      </span>
    </span>
  );
}

function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const showToast = useToast();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (isPending) {
    return (
      <div
        aria-label="অ্যাকাউন্ট লোড হচ্ছে"
        className="skeleton-block h-[38px] w-[118px] rounded-lg"
      />
    );
  }

  if (!session) {
    return (
      <nav className="flex shrink-0 items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-[13px]" aria-label="অ্যাকাউন্ট">
        <Link className="px-1 py-2 transition hover:text-[#078641]" href="/signin" prefetch={false}>
          সাইন ইন
        </Link>
        <Link className="rounded-lg bg-[#078641] px-3 py-2.5 text-white shadow-sm transition hover:bg-[#066f36] sm:px-[17px]" href="/signup" prefetch={false}>
          সাইন আপ
        </Link>
      </nav>
    );
  }

  const userName = session.user.name || session.user.email;
  const avatarInitial = Array.from(userName)[0] ?? "👤";

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-controls="account-menu-panel"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex max-w-[min(48vw,260px)] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#34443a] hover:bg-[#f4f8f4] sm:text-[13px]"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f3ea] text-sm text-[#078641]">
          {avatarInitial}
        </span>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">{userName}</span>
        <span aria-hidden="true" className="text-[10px] text-[#6a766e]">
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          aria-label="অ্যাকাউন্ট মেনু"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-xl border border-[#e5ebe6] bg-white p-2 shadow-[0_12px_30px_rgb(28_47_34_/_14%)]"
          id="account-menu-panel"
        >
          <div className="flex flex-col gap-1 border-b border-[#edf1ee] px-3 py-3">
            <strong className="text-xs font-bold text-[#29372e]">{session.user.name || "আমার অ্যাকাউন্ট"}</strong>
            <span className="overflow-hidden text-ellipsis text-[11px] text-[#78837c]">{session.user.email}</span>
          </div>
          <Link
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#3d4b42] hover:bg-[#f4f8f4]"
            href="/profile"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">👤</span>
            আমার প্রোফাইল
          </Link>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-[#a84238] hover:bg-[#fff3f1] disabled:cursor-wait disabled:opacity-60"
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              try {
                const result = await authClient.signOut();
                if (result.error) {
                  throw new Error(
                    result.error.message || "সাইন আউট করা যায়নি।",
                  );
                }
                setIsOpen(false);
                showToast("সফলভাবে সাইন আউট হয়েছে।", "success");
                router.push("/");
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
            }}
            type="button"
          >
            <span aria-hidden="true">↪</span>
            {isSigningOut ? "অপেক্ষা করুন…" : "সাইন আউট"}
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  products,
  error,
}: {
  products: Product[];
  error?: string | null;
}) {
  const pathname = usePathname();
  const date = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex min-h-[66px] max-w-[1080px] items-center justify-between gap-6 px-4 py-2">
        <Link className="inline-flex min-w-0 items-center gap-2.5" href="/" aria-label="বাজার দর — হোম">
          <span className="grid h-[39px] w-[39px] shrink-0 place-items-center overflow-hidden rounded-[11px] bg-[#078641]">
            <Image src={logoIcon} alt="" width={28} height={28} priority />
          </span>
          <span className="flex flex-col leading-[1.3]">
            <span className="text-[17px] font-extrabold tracking-[-0.3px]">বাজার দর</span>
            <span className="min-h-4 text-[11px] text-[#59635d]" suppressHydrationWarning>
              {date}
            </span>
          </span>
        </Link>

        <AccountMenu />
      </div>

      <nav className="border-y border-[#edf1ee] bg-[#fbfcfb]" aria-label="পণ্যের বিভাগ">
        <div className="mx-auto flex max-w-[1080px] justify-center gap-1 overflow-x-auto px-3 py-1.5 max-[600px]:justify-start">
          {categories.map((category) => (
            <Link
              aria-current={
                pathname === `/category/${category.id}` ? "page" : undefined
              }
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${pathname === `/category/${category.id}` ? "bg-[#e8f3ea] text-[#08763a]" : "text-[#59665e] hover:bg-[#f0f5f1] hover:text-[#08763a]"}`}
              key={category.id}
              href={`/category/${category.id}`}
            >
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <section
        aria-label="বাজারের পণ্যের বর্তমান দাম"
        className="overflow-hidden border-b border-[#056e34] bg-[#078641]"
      >
        {error ? (
          <p className="m-0 py-2 text-center text-[11px] text-white/90" role="status">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="m-0 py-2 text-center text-[11px] text-white/90" role="status">
            দামের তথ্য লোড হচ্ছে…
          </p>
        ) : (
          <div className="flex w-max animate-ticker-scroll">
            <div className="flex shrink-0 py-2.5">
              {products.map((product) => (
                <PriceItem key={product.id} product={product} />
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 py-2.5">
              {products.map((product) => (
                <PriceItem key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>
    </header>
  );
}
