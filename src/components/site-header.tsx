"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import logoIcon from "@/assets/logo-icon.png";
import {
  formatBengaliNumber,
  unitNames,
  type Product,
} from "@/lib/products";

const categories = [
  { id: "chal", name: "চাল", icon: "🍚" },
  { id: "dal", name: "ডাল", icon: "🫘" },
  { id: "tel", name: "তেল", icon: "🛢️" },
  { id: "sobji", name: "সবজি", icon: "🥬" },
  { id: "mach", name: "মাছ", icon: "🐟" },
  { id: "mangsho", name: "মাংস", icon: "🍗" },
  { id: "dim-dui", name: "ডিম-দুধ", icon: "🥛" },
  { id: "mosla", name: "মসলা", icon: "🌶️" },
];

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
  const [isSignedIn, setIsSignedIn] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!isSignedIn) {
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
          👤
        </span>
        <span>Rezwan</span>
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
            <strong>Rezwan Ahmed</strong>
            <span>rezwanahmed@gmail.com</span>
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
            onClick={() => {
              setIsOpen(false);
              setIsSignedIn(false);
            }}
            type="button"
          >
            <span aria-hidden="true">↪</span>
            সাইন আউট
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
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
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
            <button
              aria-pressed={activeCategory === category.id}
              className={`category-link${activeCategory === category.id ? " is-active" : ""}`}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              type="button"
            >
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <section
        aria-label="বাজারের পণ্যের বর্তমান দাম"
        className="price-ticker"
      >
        {error ? (
          <p className="ticker-message" role="status">
            দামের তথ্য লোড করা যায়নি: {error}
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
