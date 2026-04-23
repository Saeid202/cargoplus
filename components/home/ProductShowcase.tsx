import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductWithRelations } from "@/types";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
}

export function ProductShowcase({ products, title = "Featured Products" }: ProductShowcaseProps) {
  if (!products.length) return null;

  // Cap at 8 products — 2 rows of 4
  const displayProducts = products.slice(0, 8);

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container mx-auto px-4">

        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="inline-block mb-2 rounded-full border border-purple-300 bg-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-700">
              Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-[#1a1a2e] md:text-4xl">{title}</h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[#4B1D8F] hover:underline whitespace-nowrap"
          >
            View all →
          </Link>
        </div>

        {/* Grid — 4 columns, fixed card height */}
        <div
          data-testid="product-grid"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {displayProducts.map((product) => (
            <div key={product.id} className="flex flex-col h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
