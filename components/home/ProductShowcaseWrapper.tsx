"use client";

import dynamic from "next/dynamic";
import type { ProductWithRelations } from "@/types";

const ProductShowcase = dynamic(
  () => import("./ProductShowcase").then((m) => ({ default: m.ProductShowcase })),
  {
    ssr: false,
    loading: () => (
      <section className="py-14 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

export function ProductShowcaseWrapper({
  products,
  title,
}: {
  products: ProductWithRelations[];
  title?: string;
}) {
  return <ProductShowcase products={products} title={title} />;
}
