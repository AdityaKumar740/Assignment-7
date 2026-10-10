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
    <section className="category-empty-state">
      <span aria-hidden="true" className="category-empty-icon">
        🔎
      </span>
      <h1>এই বিভাগটি পাওয়া যায়নি</h1>
      <p>সঠিক বিভাগ নির্বাচন করে আবার চেষ্টা করুন।</p>
      <Link className="hero-cta" href="/">
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
      <main className="category-page">
        <header className="category-page-heading">
          <span aria-hidden="true" className="category-page-icon">
            {categoryData.icon}
          </span>
          <div>
            <h1>
              {categoryData.nameBn}
              <span> বাজারদর</span>
            </h1>
            <p>
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
