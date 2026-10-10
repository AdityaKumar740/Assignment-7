import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import {
  formatBengaliNumber,
  isProductList,
  productsApiUrl,
  type ProductDetails,
  unitNames,
} from "@/lib/products";

function isProductDetailsResponse(
  value: unknown,
): value is ProductDetails {
  if (!isProductList([value])) {
    return false;
  }

  const details = value as Record<string, unknown>;
  return (
    typeof details.yesterday === "number" &&
    typeof details.lastWeek === "number" &&
    typeof details.lastMonth === "number" &&
    Array.isArray(details.markets) &&
    details.markets.every(
      (market: unknown) =>
        market !== null &&
        typeof market === "object" &&
        typeof (market as Record<string, unknown>).market === "string" &&
        typeof (market as Record<string, unknown>).division === "string" &&
        typeof (market as Record<string, unknown>).min === "number" &&
        typeof (market as Record<string, unknown>).max === "number",
    )
  );
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listResponse = await fetch(productsApiUrl);
  if (!listResponse.ok) {
    throw new Error(`Product list request failed (${listResponse.status})`);
  }

  const listData: unknown = await listResponse.json();
  if (!isProductList(listData)) {
    throw new Error("The product API returned an invalid product list.");
  }

  const productSummary = listData.find((item) => item.slug === slug);
  if (!productSummary) {
    notFound();
  }

  const detailResponse = await fetch(
    `${productsApiUrl}/${productSummary.id}`,
  );
  if (!detailResponse.ok) {
    throw new Error(`Product detail request failed (${detailResponse.status})`);
  }

  const detailData: unknown = await detailResponse.json();
  if (!isProductDetailsResponse(detailData)) {
    throw new Error("The product detail API returned an invalid response.");
  }

  const product = detailData;
  const unit = unitNames[product.unit] ?? product.unit;
  const marketPrices = product.markets.flatMap((market) => [
    market.min,
    market.max,
  ]);
  const minimum = marketPrices.length
    ? Math.min(...marketPrices)
    : product.today;
  const maximum = marketPrices.length
    ? Math.max(...marketPrices)
    : product.today;
  const average = marketPrices.length
    ? marketPrices.reduce((total, price) => total + price, 0) /
      marketPrices.length
    : product.today;
  const changeLabel =
    product.change.dir === "up"
      ? `গতকালের তুলনায় দাম বেড়েছে ${formatBengaliNumber(Math.abs(product.change.pct))}%`
      : product.change.dir === "down"
        ? `গতকালের তুলনায় দাম কমেছে ${formatBengaliNumber(Math.abs(product.change.pct))}%`
        : "গতকালের তুলনায় দামের কোনো পরিবর্তন নেই";

  return (
    <>
      <SiteHeader products={listData} />
      <main className="product-detail-page">
        <nav aria-label="Breadcrumb" className="product-breadcrumb">
          <Link href="/">হোম</Link>
          <span aria-hidden="true">›</span>
          <Link href="/#সব-পণ্য">সব পণ্য</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{product.nameBn}</span>
        </nav>

        <section aria-labelledby="detail-title" className="product-detail-summary">
          <div className="product-detail-intro">
            <span aria-hidden="true" className="product-detail-image">
              {product.image}
            </span>
            <div>
              <div className="product-detail-tags">
                <span className="product-detail-tag">
                  {product.categoryNameBn}
                </span>
              </div>
              <h1 id="detail-title">{product.nameBn}</h1>
              <p className="product-detail-subtitle">{changeLabel}</p>
              <p className="product-detail-unit">প্রতি {unit}</p>
            </div>
          </div>
          <div className="product-detail-today">
            <span>আজকের দাম</span>
            <strong>
              {formatBengaliNumber(product.today)} টাকা
            </strong>
            <span>প্রতি {unit}</span>
          </div>
        </section>

        <section aria-labelledby="price-summary-title" className="detail-panel">
          <h2 id="price-summary-title">দামের সারসংক্ষেপ</h2>
          <div className="price-summary-grid">
            <article className="price-summary-card">
              <span>সর্বনিম্ন দাম</span>
              <strong className="summary-min">
                {formatBengaliNumber(minimum)} টাকা
              </strong>
              <small>প্রতি {unit}</small>
            </article>
            <article className="price-summary-card">
              <span>সর্বোচ্চ দাম</span>
              <strong className="summary-max">
                {formatBengaliNumber(maximum)} টাকা
              </strong>
              <small>প্রতি {unit}</small>
            </article>
            <article className="price-summary-card">
              <span>গড় দাম</span>
              <strong className="summary-average">
                {formatBengaliNumber(average)} টাকা
              </strong>
              <small>প্রতি {unit}</small>
            </article>
          </div>
        </section>

        <section aria-labelledby="market-prices-title" className="detail-panel">
          <div className="market-table-heading">
            <h2 id="market-prices-title">বাজারভিত্তিক আজকের দাম</h2>
            <p>বিভিন্ন বাজারের সর্বনিম্ন, সর্বোচ্চ ও গড় দাম</p>
          </div>
          {product.markets.length === 0 ? (
            <p className="market-empty">এই পণ্যের বাজারভিত্তিক দাম পাওয়া যায়নি।</p>
          ) : (
            <div className="market-table-scroll">
              <table className="market-table">
                <thead>
                  <tr>
                    <th scope="col">বাজার</th>
                    <th scope="col">বিভাগ</th>
                    <th scope="col">সর্বনিম্ন</th>
                    <th scope="col">সর্বোচ্চ</th>
                    <th scope="col">গড়</th>
                  </tr>
                </thead>
                <tbody>
                  {product.markets.map((market) => (
                    <tr key={`${market.division}-${market.market}`}>
                      <td>{market.market}</td>
                      <td>{market.division}</td>
                      <td>{formatBengaliNumber(market.min)} টাকা</td>
                      <td>{formatBengaliNumber(market.max)} টাকা</td>
                      <td>
                        {formatBengaliNumber((market.min + market.max) / 2)} টাকা
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
