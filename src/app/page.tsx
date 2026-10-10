"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import heroImage from "@/assets/bazar-hero.png";
import { SiteHeader } from "@/components/site-header";
import {
  formatBengaliNumber,
  isProductList,
  productsApiUrl,
  unitNames,
  type Product,
} from "@/lib/products";

function ProductCard({ product }: { product: Product }) {
  const changeDirection =
    product.change.dir === "up"
      ? "up"
      : product.change.dir === "down"
        ? "down"
        : "flat";
  const changeIcon =
    changeDirection === "up" ? "▲" : changeDirection === "down" ? "▼" : "—";

  return (
    <Link
      aria-label={`${product.nameBn}, আজকের দাম ${formatBengaliNumber(product.today)} টাকা`}
      className="product-card"
      href={`/product/${product.slug}`}
    >
      <div className="product-card-heading">
        <span aria-hidden="true" className="product-card-image">
          {product.image}
        </span>
        <span className="product-card-name-wrap">
          <span className="product-card-name">{product.nameBn}</span>
          <span className="product-card-unit">
            প্রতি {unitNames[product.unit] ?? product.unit}
          </span>
        </span>
      </div>
      <div className="product-card-price-row">
        <span className="product-card-price">
          <span className="product-card-price-label">আজকের দাম</span>
          <span className="product-card-price-value">
            {formatBengaliNumber(product.today)} টাকা
          </span>
        </span>
        <span className={`product-change-badge is-${changeDirection}`}>
          {changeIcon} {formatBengaliNumber(Math.abs(product.change.pct))}%
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const date = new Intl.DateTimeFormat("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(
          productsApiUrl,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Product request failed (${response.status})`);
        }

        const data: unknown = await response.json();
        if (!isProductList(data)) {
          throw new Error("The product API returned an invalid response.");
        }

        setProducts(data);
        setError(null);
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "দামের তথ্য লোড করা যায়নি।",
        );
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <>
      <SiteHeader error={error} products={products} />

      <main>
        <section aria-labelledby="hero-title" className="hero-banner">
          <div className="hero-copy">
            <p className="hero-eyebrow">{date}</p>
            <h1 id="hero-title">আজকের বাজার দর এক নজরে</h1>
            <p className="hero-subtitle">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারে যাওয়ার
              আগে জেনে নিন।
            </p>
            <a className="hero-cta" href="#সব-পণ্য">
              সব পণ্যের দাম দেখুন
            </a>
          </div>
          <div className="hero-art">
            <Image
              src={heroImage}
              alt="তাজা সবজিতে ভরা বাজারের ঝুড়ি"
              priority
              sizes="(max-width: 700px) 80vw, 360px"
            />
          </div>
        </section>

        <section
          aria-label="পণ্যের দাম ও পরিবর্তন"
          className="products-section"
        >
          {error ? (
            <p className="products-message" role="alert">
              পণ্যের তথ্য দেখানো যাচ্ছে না: {error}
            </p>
          ) : products.length === 0 ? (
            <p className="products-message" role="status">
              পণ্যের তথ্য লোড হচ্ছে…
            </p>
          ) : (
            <>
              <ProductHighlights
                products={products
                  .filter((product) => product.change.dir === "up")
                  .sort((first, second) => second.change.pct - first.change.pct)
                  .slice(0, 6)}
                title="আজ দাম বেড়েছে ▲"
                trend="up"
              />
              <ProductHighlights
                products={products
                  .filter((product) => product.change.dir === "down")
                  .sort((first, second) => first.change.pct - second.change.pct)
                  .slice(0, 6)}
                title="আজ দাম কমেছে ▼"
                trend="down"
              />
              <section
                aria-labelledby="products-title"
                className="all-products"
                id="সব-পণ্য"
              >
                <div className="products-section-heading">
                  <h2 id="products-title">সব পণ্য</h2>
                  <p>নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম ও পরিবর্তন একসাথে দেখুন।</p>
                </div>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}

function ProductHighlights({
  products,
  title,
  trend,
}: {
  products: Product[];
  title: string;
  trend: "up" | "down";
}) {
  return (
    <section
      aria-label={title}
      className={`product-highlights is-${trend}`}
    >
      <h2 className="product-section-title">{title}</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
