export const productsApiUrl =
  "https://api.api-store.workers.dev/api/bazardor/products";

export const unitNames: Record<string, string> = {
  kg: "কেজি",
  litre: "লিটার",
  dozen: "ডজন",
  piece: "পিস",
};

export type Product = {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  image: string;
  unit: string;
  today: number;
  change: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
};

export type MarketPrice = {
  market: string;
  division: string;
  min: number;
  max: number;
};

export type ProductDetails = Product & {
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  markets: MarketPrice[];
};

export function isProductList(value: unknown): value is Product[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => {
      if (item === null || typeof item !== "object") {
        return false;
      }

      const product = item as Record<string, unknown>;
      const change = product.change;
      if (change === null || typeof change !== "object") {
        return false;
      }

      const priceChange = change as Record<string, unknown>;
      return (
        typeof product.id === "number" &&
        typeof product.slug === "string" &&
        typeof product.nameBn === "string" &&
        typeof product.category === "string" &&
        typeof product.categoryNameBn === "string" &&
        typeof product.categoryIcon === "string" &&
        typeof product.image === "string" &&
        typeof product.unit === "string" &&
        typeof product.today === "number" &&
        typeof priceChange.pct === "number" &&
        ["up", "down", "flat"].includes(String(priceChange.dir))
      );
    })
  );
}

export function isProductDetails(value: unknown): value is ProductDetails {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    isProductList([product]) &&
    typeof product.yesterday === "number" &&
    typeof product.lastWeek === "number" &&
    typeof product.lastMonth === "number" &&
    Array.isArray(product.markets) &&
    product.markets.every(
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

export function formatBengaliNumber(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 1,
  }).format(value);
}
