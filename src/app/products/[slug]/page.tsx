import { redirect } from "next/navigation";

export default async function LegacyProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/product/${encodeURIComponent(slug)}`);
}
