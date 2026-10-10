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
      ? "price-change price-change-up"
      : product.change.dir === "down"
        ? "price-change price-change-down"
        : "price-change price-change-flat";

  return (
    <span className="ticker-item">
      <span aria-hidden="true">{product.categoryIcon}</span>
      <span className="ticker-name">{product.nameBn}</span>
      <span>
        {formatBengaliNumber(product.today)} টাকা/
        {unitNames[product.unit] ?? product.unit}
      </span>
      <span className={changeClass}>
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
        className="account-menu-skeleton skeleton-block"
      />
    );
  }

  if (!session) {
    return (
      <nav className="auth-actions" aria-label="অ্যাকাউন্ট">
        <Link className="sign-in" href="/signin" prefetch={false}>
          সাইন ইন
        </Link>
        <Link className="sign-up" href="/signup" prefetch={false}>
          সাইন আপ
        </Link>
      </nav>
    );
  }

  const userName = session.user.name || session.user.email;
  const avatarInitial = Array.from(userName)[0] ?? "👤";

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        aria-controls="account-menu-panel"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="account-menu-trigger"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span aria-hidden="true" className="account-avatar">
          {avatarInitial}
        </span>
        <span>{userName}</span>
        <span aria-hidden="true" className="account-menu-caret">
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          aria-label="অ্যাকাউন্ট মেনু"
          className="account-menu-panel"
          id="account-menu-panel"
        >
          <div className="account-menu-identity">
            <strong>{session.user.name || "আমার অ্যাকাউন্ট"}</strong>
            <span>{session.user.email}</span>
          </div>
          <Link
            className="account-menu-item"
            href="/profile"
            onClick={() => setIsOpen(false)}
          >
            <span aria-hidden="true">👤</span>
            আমার প্রোফাইল
          </Link>
          <button
            className="account-menu-item account-menu-signout"
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
    <header className="site-header">
      <div className="header-top">
        <Link className="brand" href="/" aria-label="বাজার দর — হোম">
          <span className="brand-mark">
            <Image src={logoIcon} alt="" width={28} height={28} priority />
          </span>
          <span className="brand-copy">
            <span className="brand-name">বাজার দর</span>
            <span className="brand-date" suppressHydrationWarning>
              {date}
            </span>
          </span>
        </Link>

        <AccountMenu />
      </div>

      <nav className="category-nav" aria-label="পণ্যের বিভাগ">
        <div className="category-list">
          {categories.map((category) => (
            <Link
              aria-current={
                pathname === `/category/${category.id}` ? "page" : undefined
              }
              className={`category-link${pathname === `/category/${category.id}` ? " is-active" : ""}`}
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
        className="price-ticker"
      >
        {error ? (
          <p className="ticker-message" role="status">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="ticker-message" role="status">
            দামের তথ্য লোড হচ্ছে…
          </p>
        ) : (
          <div className="ticker-track">
            <div className="ticker-group">
              {products.map((product) => (
                <PriceItem key={product.id} product={product} />
              ))}
            </div>
            <div aria-hidden="true" className="ticker-group">
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
