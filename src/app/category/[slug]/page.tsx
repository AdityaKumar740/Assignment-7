import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CategoryProductList } from "@/components/category-product-list";
import {
  bazardorApiUrl,
  categories,
  isCategory,
  isProductList,
  productsApiUrl,
} from "@/lib/products";

function CategoryNotFound() {
  return (
    <section className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#e5ebe6] bg-[#f7faf7] px-5 py-8 text-center">
      <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f2ea] text-[26px]">
        🔎
      </span>
      <h1 className="mb-0 mt-4 text-[22px] font-bold text-[#26332b]">এই বিভাগটি পাওয়া যায়নি</h1>
      <p className="mb-4 mt-2 text-[13px] text-[#69756d]">সঠিক বিভাগ নির্বাচন করে আবার চেষ্টা করুন।</p>
      <Link className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#078641] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#066f36]" href="/">
        হোম পেজে ফিরে যান
      </Link>
    </section>
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const knownCategory = categories.find((category) => category.id === slug);

  if (!knownCategory) {
    return (
      <>
        <SiteHeader products={[]} />
        <CategoryNotFound />
      </>
    );
  }

  const [categoryResponse, productsResponse] = await Promise.all([
    fetch(`${bazardorApiUrl}/categories/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    }),
    fetch(productsApiUrl, { cache: "no-store" }),
  ]);

  if (categoryResponse.status === 404) {
    return (
      <>
        <SiteHeader products={[]} />
        <CategoryNotFound />
      </>
    );
  }
  if (!categoryResponse.ok) {
    throw new Error(
      `Category request failed (${categoryResponse.status})`,
    );
  }
  if (!productsResponse.ok) {
    throw new Error(
      `Product request failed (${productsResponse.status})`,
    );
  }

  const [categoryData, productsData]: [unknown, unknown] = await Promise.all([
    categoryResponse.json(),
    productsResponse.json(),
  ]);
  if (!isCategory(categoryData)) {
    throw new Error("The category API returned an invalid response.");
  }
  if (!isProductList(productsData)) {
    throw new Error("The product API returned an invalid response.");
  }

  const products = productsData.filter(
    (product) => product.category === categoryData.slug,
  );

  return (
    <>
      <SiteHeader products={productsData} />
      <main className="mx-auto w-[min(100%-32px,1080px)] pb-12 pt-5 sm:pt-7">
        <header className="mb-4 flex min-h-[100px] items-center gap-3 rounded-2xl border border-[#e5ebe6] bg-[#f4f8f4] p-4">
          <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-sm">
            {categoryData.icon}
          </span>
          <div>
            <h1 className="m-0 text-[20px] font-bold text-[#29372e]">
              {categoryData.nameBn}
              <span> বাজারদর</span>
            </h1>
            <p className="mb-0 mt-1 text-[11px] text-[#718078]">
              {new Intl.NumberFormat("bn-BD").format(products.length)}টি পণ্যের
              আজকের দাম ও পরিবর্তন
            </p>
          </div>
        </header>
        {products.length === 0 ? (
          <CategoryNotFound />
        ) : (
          <CategoryProductList products={products} />
        )}
      </main>
    </>
  );
}
