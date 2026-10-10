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
      className="flex min-h-[108px] flex-col justify-between gap-3 rounded-xl border border-[#e5ebe6] bg-white p-3 shadow-[0_3px_12px_rgb(30_50_36_/_4%)] transition duration-150 hover:-translate-y-0.5 hover:border-[#afd5bb] hover:shadow-[0_8px_20px_rgb(30_80_45_/_9%)] sm:p-3.5"
      href={`/product/${product.slug}`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#f0f5f1] text-[22px]">
          {product.image}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[#29372e] sm:text-sm">{product.nameBn}</span>
          <span className="text-[10px] text-[#78837c] sm:text-[11px]">
            প্রতি {unitNames[product.unit] ?? product.unit}
          </span>
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[9px] text-[#78837c] sm:text-[10px]">আজকের দাম</span>
          <span className="whitespace-nowrap text-[13px] font-bold text-[#263c2d] sm:text-sm">
            {formatBengaliNumber(product.today)} টাকা
          </span>
        </span>
        <span className={`shrink-0 rounded-md px-1.5 py-1 text-[9px] font-bold sm:px-2 sm:text-[10px] ${changeDirection === "up" ? "bg-[#eaf6ed] text-[#168342]" : changeDirection === "down" ? "bg-[#fff0ee] text-[#d24a40]" : "bg-[#f0f2f1] text-[#7c8580]"}`}>
          {changeIcon} {formatBengaliNumber(Math.abs(product.change.pct))}%
        </span>
      </div>
    </Link>
  );
}
