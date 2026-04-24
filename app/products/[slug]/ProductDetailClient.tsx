"use client";

import { useState } from "react";
import { ShoppingCart, Check, MessageSquare, Tag } from "lucide-react";
import type { ProductWithRelations, ProductImageData } from "@/types";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

interface Props {
  product: ProductWithRelations;
}

export function ProductDetailClient({ product }: Props) {
  const masterImage = product.images.find((img) => img.isMaster) ?? product.images[0] ?? null;
  const variantImages = product.images.filter((img) => !img.isMaster && img.id !== masterImage?.id);

  const hasVariants = variantImages.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<ProductImageData | null>(
    hasVariants ? (masterImage ?? null) : null
  );

  const activeImage = selectedVariant ?? masterImage;
  const activePrice =
    selectedVariant?.variantPrice != null ? selectedVariant.variantPrice : product.price;
  const activeCode = selectedVariant?.variantCode ?? masterImage?.variantCode ?? null;

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
      {/* ── LEFT: Thumbnail column + main image ── */}
      <div className="flex gap-3">
        {/* Vertical thumbnail column */}
        {hasVariants && (
          <div
            className="flex flex-col gap-2 overflow-y-auto max-h-[480px] p-2 rounded-2xl"
            style={{
              background: `linear-gradient(180deg, ${PURPLE}18 0%, ${PURPLE}08 100%)`,
              border: `1.5px solid ${PURPLE}33`,
              boxShadow: `inset 0 1px 4px ${PURPLE}18`,
            }}
          >
            {/* Master thumbnail */}
            {masterImage && (
              <button
                type="button"
                onClick={() => setSelectedVariant(masterImage)}
                className="group flex flex-col items-center gap-1 focus:outline-none flex-shrink-0"
              >
                <div
                  className="relative h-16 w-16 rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    border: selectedVariant?.id === masterImage.id
                      ? `2.5px solid ${GOLD}`
                      : `2px solid ${PURPLE}44`,
                    boxShadow: selectedVariant?.id === masterImage.id
                      ? `0 0 0 2px ${PURPLE}, 0 4px 12px ${PURPLE}44`
                      : `0 2px 6px ${PURPLE}22`,
                    transform: selectedVariant?.id === masterImage.id ? "scale(1.06)" : "scale(1)",
                  }}
                >
                  <img src={masterImage.url} alt="Master" className="w-full h-full object-contain bg-white" />
                </div>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-center leading-tight max-w-[64px] truncate"
                  style={{
                    backgroundColor: selectedVariant?.id === masterImage.id ? PURPLE : "#EDE9F6",
                    color: selectedVariant?.id === masterImage.id ? "white" : PURPLE,
                  }}
                >
                  {masterImage.variantCode ?? "Master"}
                </span>
              </button>
            )}

            {/* Variant thumbnails */}
            {variantImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedVariant(img)}
                className="group flex flex-col items-center gap-1 focus:outline-none flex-shrink-0"
              >
                <div
                  className="relative h-16 w-16 rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    border: selectedVariant?.id === img.id
                      ? `2.5px solid ${GOLD}`
                      : `2px solid ${PURPLE}44`,
                    boxShadow: selectedVariant?.id === img.id
                      ? `0 0 0 2px ${PURPLE}, 0 4px 12px ${PURPLE}44`
                      : `0 2px 6px ${PURPLE}22`,
                    transform: selectedVariant?.id === img.id ? "scale(1.06)" : "scale(1)",
                  }}
                >
                  <img src={img.url} alt={img.variantCode ?? ""} className="w-full h-full object-contain bg-white" />
                </div>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors text-center leading-tight max-w-[64px] truncate"
                  style={{
                    backgroundColor: selectedVariant?.id === img.id ? PURPLE : "#EDE9F6",
                    color: selectedVariant?.id === img.id ? "white" : PURPLE,
                  }}
                >
                  {img.variantCode ?? `#${variantImages.indexOf(img) + 2}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden"
            style={{
              boxShadow: `0 0 0 1px ${PURPLE}, 0 0 0 4px ${GOLD}, 0 0 0 5px ${PURPLE}`,
            }}
          >
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.altText ?? product.name}
                className="w-full h-full object-contain bg-white transition-all duration-300"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 min-h-[400px]">
                No image available
              </div>
            )}
            {hasDiscount && (
              <span
                className="absolute top-4 left-4 rounded-lg px-3 py-1 text-sm font-bold text-white"
                style={{ backgroundColor: GOLD }}
              >
                Sale
              </span>
            )}
            {activeCode && (
              <span
                className="absolute bottom-4 right-4 rounded-lg px-3 py-1 text-xs font-bold text-white tracking-widest"
                style={{ backgroundColor: "rgba(75,29,143,0.85)" }}
              >
                {activeCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Details ── */}
      <div className="flex flex-col">
        {/* Name + Price on one line */}
        <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <span className="text-2xl font-bold" style={{ color: PURPLE }}>
              ${activePrice.toFixed(2)} CAD
            </span>
            {hasDiscount && selectedVariant?.variantPrice == null && (
              <span className="text-base text-gray-400 line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
            {selectedVariant?.variantPrice != null && selectedVariant.variantPrice !== product.price && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE9F6", color: PURPLE }}>
                Variant price
              </span>
            )}
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</span>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${PURPLE}18`, color: PURPLE, border: `1px solid ${PURPLE}33` }}
          >
            {product.category.name}
          </span>
        </div>

        {/* Selected variant indicator */}
        {hasVariants && activeCode && (
          <div
            className="inline-flex items-center gap-2 self-start mb-4 px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#EDE9F6", color: PURPLE }}
          >
            <Tag className="h-3.5 w-3.5" />
            Selected: <span style={{ color: GOLD }}>{activeCode}</span>
          </div>
        )}

        {/* Stock */}
        <div className="mb-5">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <Check className="h-4 w-4" /> In Stock ({product.stockQuantity} available)
            </span>
          ) : (
            <span className="text-sm text-red-500 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-5">
            <h2 className="font-bold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Variant codes table */}
        {hasVariants && (
          <div className="mb-5">
            <h2 className="font-bold text-gray-900 mb-3">Product Variants</h2>
            <div
              className="rounded-2xl overflow-hidden border"
              style={{ borderColor: `${GOLD}55`, boxShadow: `0 0 0 1px ${PURPLE}22` }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-white uppercase tracking-wider">Code</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-white uppercase tracking-wider">Price (CAD)</th>
                    <th className="px-4 py-2.5 text-left text-xs font-bold text-white uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Master row — always show */}
                  {masterImage && (
                    <tr
                      className="cursor-pointer transition-colors"
                      style={{ backgroundColor: selectedVariant?.id === masterImage.id ? "#EDE9F6" : "white" }}
                      onClick={() => setSelectedVariant(masterImage)}
                    >
                      <td className="px-4 py-2.5 font-bold" style={{ color: GOLD }}>
                        {masterImage.variantCode ?? "Main"}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: GOLD }}>
                          ★ Master
                        </span>
                      </td>
                    </tr>
                  )}
                  {variantImages.map((img) => (
                    <tr
                      key={img.id}
                      className="cursor-pointer transition-colors"
                      style={{ backgroundColor: selectedVariant?.id === img.id ? "#EDE9F6" : "white" }}
                      onClick={() => setSelectedVariant(img)}
                    >
                      <td className="px-4 py-2.5 font-semibold" style={{ color: PURPLE }}>
                        {img.variantCode ?? `Image ${variantImages.indexOf(img) + 2}`}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        ${(img.variantPrice ?? product.price).toFixed(2)}
                        {img.variantPrice == null && <span className="ml-1 text-xs text-gray-400">(same as master)</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE9F6", color: PURPLE }}>
                          Variant
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Specifications */}
        {Object.keys(product.specifications).length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-gray-900 mb-2">Specifications</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-gray-400 capitalize text-xs">{key.replace(/_/g, " ")}</dt>
                  <dd className="font-semibold text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Seller */}
        <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: "#EDE9F6" }}>
          <p className="text-xs text-gray-500">Sold by</p>
          <p className="font-bold text-sm" style={{ color: PURPLE }}>{product.seller.businessName}</p>
        </div>

        {/* CTAs */}
        <div className="mt-auto space-y-3">
          <button
            disabled={!inStock}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
          >
            <ShoppingCart className="h-5 w-5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          {/* Quote CTA — references the selected variant code */}
          {hasVariants && activeCode && (
            <a
              href={`/contact?subject=Quote request for ${activeCode}`}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold border-2 transition-all hover:bg-[#EDE9F6]"
              style={{ borderColor: GOLD, color: PURPLE }}
            >
              <MessageSquare className="h-4 w-4" />
              Request Quote for <span style={{ color: GOLD }}>{activeCode}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
