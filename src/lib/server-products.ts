import {
  isProductList,
  productsApiUrl,
  type Product,
} from "@/lib/products";

export async function getProductsForHeader(): Promise<{
  products: Product[];
  error: string | null;
}> {
  try {
    const response = await fetch(productsApiUrl, { cache: "no-store" });
    if (!response.ok) {
      return {
        products: [],
        error: `দামের তথ্য লোড করা যায়নি (${response.status})।`,
      };
    }

    const data: unknown = await response.json();
    if (!isProductList(data)) {
      return {
        products: [],
        error: "দামের API থেকে সঠিক তথ্য পাওয়া যায়নি।",
      };
    }

    return { products: data, error: null };
  } catch (error) {
    return {
      products: [],
      error:
        error instanceof Error
          ? `দামের তথ্য লোড করা যায়নি: ${error.message}`
          : "দামের তথ্য লোড করা যায়নি।",
    };
  }
}
