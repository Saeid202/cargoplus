"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { ProductWithRelations, CategoryData } from "@/types";

interface ProductCatalogProps {
  initialProducts: ProductWithRelations[];
  categories: CategoryData[];
}

export function ProductCatalog({ initialProducts, categories }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      count: initialProducts.filter((p) => p.category.slug === cat.slug).length,
    }));
  }, [categories, initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (selectedCategory && p.category.slug !== selectedCategory) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
  }, [selectedCategory, priceRange, initialProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 shrink-0">
          <ProductFilters
            categories={categoriesWithCount}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredProducts.length} of {initialProducts.length} products
          </p>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange([0, 50000]);
                }}
                className="mt-4 text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
