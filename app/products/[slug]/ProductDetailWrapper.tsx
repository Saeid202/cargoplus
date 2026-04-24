"use client";

import dynamic from "next/dynamic";
import type { ProductWithRelations } from "@/types";

const ProductDetailClient = dynamic(
  () => import("./ProductDetailClient").then((m) => ({ default: m.ProductDetailClient })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-gray-100" /> }
);

export function ProductDetailWrapper({ product }: { product: ProductWithRelations }) {
  return <ProductDetailClient product={product} />;
}
