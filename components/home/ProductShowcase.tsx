"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProductWithRelations } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductShowcaseProps {
  products: ProductWithRelations[];
  title?: string;
}

type Tab = "Prefab" | "Robot";

const EASE = [0.22, 1, 0.36, 1] as const;

function filterProducts(products: ProductWithRelations[], tab: Tab) {
  return products.filter((p) => {
    const slug = p.category.slug.toLowerCase();
    if (tab === "Robot") return slug.includes("robot");
    return slug.includes("pre-fabricated") || slug.includes("prefab") || slug.includes("steel");
  });
}

export function ProductShowcase({ products, title = "Projects" }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Prefab");

  if (!products.length) return null;

  const filtered = filterProducts(products, activeTab);

  return (
    <section id="products" className="relative py-24 bg-white">
      <div className="container mx-auto px-6">

        {/* Header row */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold mb-3" style={{ color: '#D4AF37' }}>
              Catalog
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-tight">
              Our <span style={{ color: '#4B1D8F' }}>{title}</span>
            </h2>
            <div className="mt-4 flex items-start gap-3 max-w-md">
              <div className="mt-[0.45rem] h-0.5 w-6 shrink-0 rounded-full" style={{ background: '#D4AF37' }} />
              <p className="text-sm text-gray-500 leading-relaxed">
                Browse our curated selection of prefabricated structures and industrial solutions.
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-200"
            style={{ color: '#4B1D8F' }}
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-10">
          {(["Prefab", "Robot"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab ? "text-white" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filtered.length === 0 ? (
              <div className="col-span-2 lg:col-span-4 flex items-center justify-center py-20 text-muted-foreground text-sm">
                No products in this category yet.
              </div>
            ) : (
              filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile "View all" link */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            View all products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
