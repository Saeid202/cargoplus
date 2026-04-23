"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { ProductWithRelations } from "@/types";

interface ProductCardProps {
  product: ProductWithRelations;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const image = product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            Sale
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-muted-foreground mb-0.5">{product.category.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-sm leading-snug hover:text-primary transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            ${product.price.toFixed(2)} CAD
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => onAddToCart?.(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="flex flex-1 min-h-[36px] items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex min-h-[36px] items-center justify-center rounded-lg border border-border px-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
