"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

type SortOrder = "default" | "price-ascending" | "price-descending";

export function CategoryProductList({ products }: { products: Product[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const sortedProducts = useMemo(() => {
    if (sortOrder === "default") {
      return products;
    }

    return [...products].sort((first, second) =>
      sortOrder === "price-ascending"
        ? first.today - second.today
        : second.today - first.today,
    );
  }, [products, sortOrder]);

  return (
    <>
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-[#e5ebe6] bg-white px-4 py-2">
        <label className="text-xs font-semibold text-[#59665e]" htmlFor="category-sort">সাজান:</label>
        <select
          className="max-w-[min(72vw,260px)] min-h-9 rounded-lg border border-[#dfe6e0] bg-white px-3 text-xs text-[#34443a] outline-none focus:border-[#078641] focus:ring-2 focus:ring-[#078641]/10"
          id="category-sort"
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (
              value === "default" ||
              value === "price-ascending" ||
              value === "price-descending"
            ) {
              setSortOrder(value);
            }
          }}
          value={sortOrder}
        >
          <option value="default">ডিফল্ট</option>
          <option value="price-ascending">দাম: কম থেকে বেশি</option>
          <option value="price-descending">দাম: বেশি থেকে কম</option>
        </select>
      </div>
      <p className="my-3 text-[11px] text-[#768179]">
        মোট {new Intl.NumberFormat("bn-BD").format(products.length)}টি পণ্য দেখানো হচ্ছে
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
