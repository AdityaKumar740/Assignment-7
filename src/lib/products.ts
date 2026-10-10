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

export function formatBengaliNumber(value: number): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: 1,
  }).format(value);
}
