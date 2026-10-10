"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import heroImage from "@/assets/bazar-hero.png";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import {
  isProductList,
  productsApiUrl,
  type Product,
} from "@/lib/products";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
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
        setIsLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <>
      <SiteHeader error={error} products={products} />

      <main>
        <section aria-labelledby="hero-title" className="mx-auto my-3 grid min-h-[220px] w-[min(100%-24px,1152px)] grid-cols-1 items-center gap-1 overflow-hidden rounded-[19px] bg-[#f0f7f0] px-4 py-5 max-[400px]:px-3 sm:my-5 sm:min-h-[350px] sm:w-[min(100%-40px,1152px)] sm:grid-cols-[1.2fr_0.8fr] sm:gap-5 sm:rounded-[28px] sm:px-12 sm:py-7">
          <div className="relative z-10">
            <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#13813f] shadow-sm">
              {date}
            </p>
            <h1 id="hero-title" className="m-0 text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.2] tracking-[-1px] text-[#20372a]">
              আজকের বাজার দর এক নজরে
            </h1>
            <p className="my-3.5 max-w-[510px] text-[13px] leading-[1.8] text-[#59665e] sm:text-[15px]">
              চাল, ডাল, তেল, সবজি, মাছ, মাংস, ডিম ও মসলার দাম — বাজারে যাওয়ার
              আগে জেনে নিন।
            </p>
            <a className="inline-flex min-h-11 items-center justify-center rounded-[9px] bg-[#078641] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_3px_7px_rgb(6_111_54_/_20%)] transition hover:bg-[#066f36] sm:text-sm" href="#সব-পণ্য">
              সব পণ্যের দাম দেখুন
            </a>
          </div>
          <div className="relative flex min-h-[110px] items-center justify-center sm:h-full sm:min-h-[210px]">
            <Image
              src={heroImage}
              alt="তাজা সবজিতে ভরা বাজারের ঝুড়ি"
              priority
              sizes="(max-width: 700px) 80vw, 360px"
              className="h-auto max-h-[150px] w-full max-w-[220px] object-contain sm:max-h-[290px] sm:max-w-[360px]"
            />
          </div>
        </section>

        <section
          aria-label="পণ্যের দাম ও পরিবর্তন"
          className="mx-auto w-[min(100%,1080px)] px-5 pb-12 pt-5 sm:px-6"
        >
          {error ? (
            <p className="rounded-xl border border-[#f0c4bf] bg-[#fff5f4] p-4 text-sm text-[#a22d25]" role="alert">
              পণ্যের তথ্য দেখানো যাচ্ছে না: {error}
            </p>
          ) : isLoading ? (
            <div aria-busy="true" aria-label="পণ্যের তথ্য লোড হচ্ছে" role="status">
              <p className="rounded-xl bg-[#f7faf7] p-4 text-sm text-[#59635d]">
                পণ্যের তথ্য লোড হচ্ছে…
              </p>
              <div aria-hidden="true" className="mt-3 grid grid-cols-2 gap-2 max-[400px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    className="flex min-h-[108px] flex-col justify-between gap-3 rounded-xl border border-[#e5ebe6] bg-white p-3.5"
                    key={index}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="skeleton-block h-10 w-10 rounded-[10px]" />
                      <span className="grid flex-1 gap-2">
                        <span className="skeleton-block h-3 w-4/5 rounded" />
                        <span className="skeleton-block h-2.5 w-2/5 rounded" />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="skeleton-block h-3 w-1/3 rounded" />
                      <span className="skeleton-block h-5 w-12 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <p className="rounded-xl bg-[#f7faf7] p-4 text-sm text-[#59635d]" role="status">
              কোনো পণ্য পাওয়া যায়নি।
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
                className="mb-9 scroll-mt-5"
                id="সব-পণ্য"
              >
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <h2 id="products-title" className="m-0 text-xl font-bold text-[#24372b]">সব পণ্য</h2>
                  <p className="m-0 text-xs leading-5 text-[#758078]">নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম ও পরিবর্তন একসাথে দেখুন।</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-[400px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
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
      className={`mb-8 ${trend === "up" ? "rounded-2xl bg-[#f4faf5] p-4 sm:p-5" : "rounded-2xl bg-[#fff7f6] p-4 sm:p-5"}`}
    >
      <h2 className={`mb-3 mt-0 text-lg font-bold ${trend === "up" ? "text-[#176f38]" : "text-[#a7433c]"}`}>{title}</h2>
      <div className="grid grid-cols-2 gap-2 max-[400px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
