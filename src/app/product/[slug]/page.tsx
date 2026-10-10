import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import {
  formatBengaliNumber,
  isProductDetails,
  isProductList,
  productsApiUrl,
  unitNames,
} from "@/lib/products";

export const dynamicParams = true;

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

  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    const callbackURL = encodeURIComponent(`/product/${slug}`);
    redirect(`/signin?callbackURL=${callbackURL}&notice=protected-route`);
  }

  const detailResponse = await fetch(
    `${productsApiUrl}/${productSummary.id}`,
    { cache: "no-store" },
  );
  if (!detailResponse.ok) {
    throw new Error(`Product detail request failed (${detailResponse.status})`);
  }

  const detailData: unknown = await detailResponse.json();
  if (!isProductDetails(detailData)) {
    throw new Error("The product detail API returned an invalid response.");
  }
  if (detailData.id !== productSummary.id) {
    throw new Error("The product detail API returned a different product.");
  }

  const product = detailData;
  const unit = unitNames[product.unit] ?? product.unit;
  const marketPriceRows = product.markets.map((market) => ({
    ...market,
    average: (market.min + market.max) / 2,
  }));
  const marketPrices = marketPriceRows.flatMap((market) => [
    market.min,
    market.max,
  ]);
  const minimum = marketPrices.length
    ? Math.min(...marketPrices)
    : product.today;
  const maximum = marketPrices.length
    ? Math.max(...marketPrices)
    : product.today;
  const average = marketPriceRows.length
    ? marketPriceRows.reduce((total, market) => total + market.average, 0) /
      marketPriceRows.length
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
      <main className="mx-auto w-[min(100%-32px,900px)] pb-12 pt-5">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-[#78837c]">
          <Link className="hover:text-[#078641]" href="/">হোম</Link>
          <span aria-hidden="true">›</span>
          <Link className="hover:text-[#078641]" href="/#সব-পণ্য">সব পণ্য</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page" className="font-semibold text-[#34443a]">{product.nameBn}</span>
        </nav>

        <section aria-labelledby="detail-title" className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-[#e5ebe6] bg-[#f6f9f6] p-5 max-[600px]:items-start max-[600px]:gap-2 max-[600px]:p-3.5">
          <div className="flex min-w-0 items-center gap-4 max-[600px]:items-start max-[600px]:gap-2.5">
            <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-[34px] shadow-sm max-[600px]:h-[46px] max-[600px]:w-[46px] max-[600px]:rounded-xl max-[600px]:text-[26px]">
              {product.image}
            </span>
            <div className="min-w-0">
              <div className="mb-1.5 flex gap-1.5">
                <span className="rounded-full bg-[#e8f3ea] px-2.5 py-1 text-[10px] font-semibold text-[#19723a]">
                  {product.categoryNameBn}
                </span>
              </div>
              <h1 className="m-0 text-[25px] font-bold text-[#26372c] max-[600px]:text-xl" id="detail-title">{product.nameBn}</h1>
              <p className="mb-1 mt-1 text-xs leading-5 text-[#69756d] max-[600px]:text-[10px]">{changeLabel}</p>
              <p className="m-0 text-[11px] font-medium text-[#7b857e]">প্রতি {unit}</p>
            </div>
          </div>
          <div className="flex min-w-[130px] shrink-0 flex-col items-center gap-1 rounded-xl bg-white px-4 py-3 text-[11px] text-[#68756d] shadow-sm max-[600px]:min-w-[90px] max-[600px]:px-2 max-[600px]:py-2 max-[600px]:text-[9px]">
            <span>আজকের দাম</span>
            <strong className="text-xl font-extrabold text-[#078641] max-[600px]:text-[15px]">
              {formatBengaliNumber(product.today)} টাকা
            </strong>
            <span>প্রতি {unit}</span>
          </div>
        </section>

        <section aria-labelledby="price-summary-title" className="mb-4 rounded-2xl border border-[#e5ebe6] bg-white p-5 max-[600px]:p-3.5">
          <h2 className="mb-4 mt-0 text-lg font-bold text-[#29372e] max-[600px]:text-[15px]" id="price-summary-title">দামের সারসংক্ষেপ</h2>
          <div className="grid grid-cols-3 gap-3 max-[600px]:gap-1.5">
            <article className="flex min-h-[96px] flex-col justify-center gap-1 rounded-xl bg-[#f4faf5] p-3 max-[600px]:min-h-[74px] max-[600px]:p-2">
              <span className="text-[11px] text-[#718078] max-[600px]:text-[9px]">সর্বনিম্ন দাম</span>
              <strong className="text-lg font-bold text-[#17813f] max-[600px]:text-sm">
                {formatBengaliNumber(minimum)} টাকা
              </strong>
              <small className="text-[10px] text-[#7b857e]">প্রতি {unit}</small>
            </article>
            <article className="flex min-h-[96px] flex-col justify-center gap-1 rounded-xl bg-[#fff6f4] p-3 max-[600px]:min-h-[74px] max-[600px]:p-2">
              <span className="text-[11px] text-[#718078] max-[600px]:text-[9px]">সর্বোচ্চ দাম</span>
              <strong className="text-lg font-bold text-[#cc5548] max-[600px]:text-sm">
                {formatBengaliNumber(maximum)} টাকা
              </strong>
              <small className="text-[10px] text-[#7b857e]">প্রতি {unit}</small>
            </article>
            <article className="flex min-h-[96px] flex-col justify-center gap-1 rounded-xl bg-[#f4f7fb] p-3 max-[600px]:min-h-[74px] max-[600px]:p-2">
              <span className="text-[11px] text-[#718078] max-[600px]:text-[9px]">গড় দাম</span>
              <strong className="text-lg font-bold text-[#426d9a] max-[600px]:text-sm">
                {formatBengaliNumber(average)} টাকা
              </strong>
              <small className="text-[10px] text-[#7b857e]">প্রতি {unit}</small>
            </article>
          </div>
        </section>

        <section aria-labelledby="market-prices-title" className="rounded-2xl border border-[#e5ebe6] bg-white p-5 max-[600px]:p-3.5">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-bold text-[#29372e] max-[600px]:text-[15px]" id="market-prices-title">বাজারভিত্তিক আজকের দাম</h2>
            <p className="mb-0 mt-1 text-[11px] text-[#7b857e]">বিভিন্ন বাজারের সর্বনিম্ন, সর্বোচ্চ ও গড় দাম</p>
          </div>
          {product.markets.length === 0 ? (
            <p className="rounded-lg bg-[#f7faf7] p-4 text-center text-xs text-[#718078]">এই পণ্যের বাজারভিত্তিক দাম পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                <thead className="bg-[#f4f8f4] text-[11px] text-[#59665e]">
                  <tr>
                    <th className="px-3 py-3 font-semibold" scope="col">বাজার</th>
                    <th className="px-3 py-3 font-semibold" scope="col">বিভাগ</th>
                    <th className="px-3 py-3 font-semibold" scope="col">সর্বনিম্ন</th>
                    <th className="px-3 py-3 font-semibold" scope="col">সর্বোচ্চ</th>
                    <th className="px-3 py-3 font-semibold" scope="col">গড়</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPriceRows.map((market) => (
                    <tr key={`${market.division}-${market.market}`}>
                      <td className="border-b border-[#edf1ee] px-3 py-3">{market.market}</td>
                      <td className="border-b border-[#edf1ee] px-3 py-3">{market.division}</td>
                      <td className="border-b border-[#edf1ee] px-3 py-3">{formatBengaliNumber(market.min)} টাকা</td>
                      <td className="border-b border-[#edf1ee] px-3 py-3">{formatBengaliNumber(market.max)} টাকা</td>
                      <td className="border-b border-[#edf1ee] px-3 py-3">
                        {formatBengaliNumber(market.average)} টাকা
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
