import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatBengaliNumber,
  isProductList,
  productsApiUrl,
  unitNames,
} from "@/lib/products";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const response = await fetch(productsApiUrl);

  if (!response.ok) {
    throw new Error(`Product request failed (${response.status})`);
  }

  const data: unknown = await response.json();
  if (!isProductList(data)) {
    throw new Error("The product API returned an invalid response.");
  }

  const product = data.find((item) => item.slug === slug);
  if (!product) {
    notFound();
  }

  const changeDirection =
    product.change.dir === "up"
      ? "up"
      : product.change.dir === "down"
        ? "down"
        : "flat";
  const changeIcon =
    changeDirection === "up" ? "▲" : changeDirection === "down" ? "▼" : "—";

  return (
    <main className="product-detail-page">
      <Link className="product-back-link" href="/#সব-পণ্য">
        ← সব পণ্যে ফিরে যান
      </Link>
      <article className="product-detail-card">
        <span aria-hidden="true" className="product-detail-image">
          {product.image}
        </span>
        <p className="product-detail-category">
          {product.categoryIcon} {product.categoryNameBn}
        </p>
        <h1>{product.nameBn}</h1>
        <p className="product-detail-unit">
          প্রতি {unitNames[product.unit] ?? product.unit}
        </p>
        <p className="product-detail-price-label">আজকের দাম</p>
        <p className="product-detail-price">
          {formatBengaliNumber(product.today)} টাকা
        </p>
        <span className={`product-change-badge is-${changeDirection}`}>
          {changeIcon} {formatBengaliNumber(Math.abs(product.change.pct))}%
        </span>
      </article>
    </main>
  );
}
