import "server-only";
import {
  categoriesApiUrl,
  isCategoryList,
  isProductList,
  productsApiUrl,
  type Category,
  type Product,
} from "@/lib/products";

export type HeaderData = {
  products: Product[];
  error: string | null;
  categories: Category[];
  categoryError: string | null;
};

export async function getProductsForHeader(): Promise<{
  products: Product[];
  error: string | null;
}> {
  try {
    const response = await fetch(productsApiUrl, { next: { revalidate: 300 } });
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

export async function getCategoriesForHeader(): Promise<{
  categories: Category[];
  categoryError: string | null;
}> {
  try {
    const response = await fetch(categoriesApiUrl, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return {
        categories: [],
        categoryError: `বিভাগ লোড করা যায়নি (${response.status})।`,
      };
    }

    const data: unknown = await response.json();
    if (!isCategoryList(data)) {
      return {
        categories: [],
        categoryError: "বিভাগের API থেকে সঠিক তথ্য পাওয়া যায়নি।",
      };
    }

    return { categories: data, categoryError: null };
  } catch (error) {
    return {
      categories: [],
      categoryError:
        error instanceof Error
          ? `বিভাগ লোড করা যায়নি: ${error.message}`
          : "বিভাগের তথ্য লোড করা যায়নি।",
    };
  }
}

export async function getHeaderData(): Promise<HeaderData> {
  const [productData, categoryData] = await Promise.all([
    getProductsForHeader(),
    getCategoriesForHeader(),
  ]);

  return { ...productData, ...categoryData };
}
