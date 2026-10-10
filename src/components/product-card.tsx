import Link from "next/link";
import {
  formatBengaliNumber,
  unitNames,
  type Product,
} from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
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
