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
      <div className="category-sort-bar">
        <label htmlFor="category-sort">সাজান:</label>
        <select
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
      <p className="category-result-count">
        মোট {new Intl.NumberFormat("bn-BD").format(products.length)}টি পণ্য দেখানো হচ্ছে
      </p>
      <div className="product-grid category-product-grid">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
