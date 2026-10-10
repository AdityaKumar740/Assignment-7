import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CategoryProductList } from "@/components/category-product-list";
import {
  bazardorApiUrl,
  isCategory,
  isProductList,
  productsApiUrl,
} from "@/lib/products";
import { getCategoriesForHeader } from "@/lib/server-products";

export const dynamicParams = true;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categoryUrl = `${bazardorApiUrl}/categories/${encodeURIComponent(slug)}`;
  const categoryProductsUrl = new URL(productsApiUrl);
  categoryProductsUrl.searchParams.set("category", slug);
  const [categoryResponse, productsResponse, headerCategories] = await Promise.all([
    fetch(categoryUrl, { next: { revalidate: 3600 } }),
    fetch(categoryProductsUrl, { next: { revalidate: 300 } }),
    getCategoriesForHeader(),
  ]);

  if (categoryResponse.status === 404) {
    notFound();
  }
  if (!categoryResponse.ok) {
    throw new Error(`Category request failed (${categoryResponse.status})`);
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

  const products = productsData.filter((product) => product.category === slug);

  return (
    <>
      <SiteHeader
        categories={headerCategories.categories}
        categoryError={headerCategories.categoryError}
        products={productsData}
      />
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
          notFound()
        ) : (
          <CategoryProductList products={products} />
        )}
      </main>
    </>
  );
}
