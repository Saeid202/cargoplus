"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/seller";
import type { Category } from "@/types/database";
import { Tag, DollarSign, Layers, Hash, FileText, ChevronDown } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";
import { SpecificationsEditor } from "@/components/seller/SpecificationsEditor";
import { DraggableVariantGrid, newSlot, type VariantSlot } from "@/components/seller/DraggableVariantGrid";

interface NewProductFormProps {
  categories: Category[];
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

function Field({ label, hint, required, icon: Icon, children }: {
  label: string; hint?: string; required?: boolean; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: "#EDE9F6" }}>
            <Icon className="h-3.5 w-3.5" style={{ color: PURPLE }} />
          </span>
        )}
        <label className="text-sm font-semibold text-gray-700">
          {label}{required && <span className="ml-1 font-bold" style={{ color: GOLD }}>*</span>}
        </label>
      </div>
      {children}
      {hint && <p className="text-xs text-gray-400 pl-8">{hint}</p>}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}55, transparent)` }} />
      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GOLD }}>{title}</span>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, ${GOLD}55, transparent)` }} />
    </div>
  );
}

const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow";

export function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantSlot[]>([newSlot(true)]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const specObj: Record<string, string> = {};
    specs.forEach(({ key, value }) => { if (key && value) specObj[key] = value; });
    formData.set("specifications", JSON.stringify(specObj));
    const variantsMeta = variants.map((v) => ({
      code: v.code, price: v.price ? parseFloat(v.price) : null, isMaster: v.isMaster,
    }));
    formData.set("variantsJson", JSON.stringify(variantsMeta));
    variants.forEach((v, i) => { if (v.file) formData.set(`variant_file_${i}`, v.file); });
    const result = await createProduct(formData);
    if (result.error) { setError(result.error); setLoading(false); return; }
    router.push("/seller/products");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          <span className="mt-0.5 shrink-0">⚠</span> {error}
        </div>
      )}

      <Section title="Product Images & Variants" />
      <DraggableVariantGrid variants={variants} onChange={setVariants} />

      <Section title="Product Details" />
      <Field label="Product Name" required icon={Tag}>
        <input id="name" name="name" type="text" required className={inputClass} placeholder="e.g., Premium Flooring Collection" />
      </Field>
      <Field label="Description" required icon={FileText}>
        <textarea id="description" name="description" rows={4} required className={`${inputClass} resize-none`}
          placeholder="Describe your product — materials, dimensions, use cases..." />
      </Field>

      <Section title="Pricing & Inventory" />
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Category" required icon={Layers}>
          <div className="relative">
            <select id="categoryId" name="categoryId" required className={`${inputClass} appearance-none pr-9`}>
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </Field>
        <Field label="Master Price (CAD)" required icon={DollarSign}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input id="price" name="price" type="number" step="0.01" min="0" required className={`${inputClass} pl-7`} placeholder="299.99" />
          </div>
        </Field>
        <Field label="Compare at Price (CAD)" icon={DollarSign} hint="Original price — used to show a discount badge">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
            <input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" className={`${inputClass} pl-7`} placeholder="349.99" />
          </div>
        </Field>
        <Field label="Stock Quantity" required icon={Hash}>
          <input id="stockQuantity" name="stockQuantity" type="number" min="0" required className={inputClass} placeholder="100" />
        </Field>
      </div>

      <Section title="Specifications" />
      <SpecificationsEditor specs={specs} onChange={setSpecs} />

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? "Creating Product..." : "Create Product"}
        </LuxuryButton>
      </div>
    </form>
  );
}
