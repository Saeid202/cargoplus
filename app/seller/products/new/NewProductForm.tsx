"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/seller";
import type { Category } from "@/types/database";
import { X, Tag, DollarSign, Layers, Hash, FileText, ChevronDown } from "lucide-react";
import { LuxuryButton } from "@/components/seller/LuxuryButton";
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

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const updated = [...specs]; updated[i][field] = val; setSpecs(updated);
  };

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
      <div className="space-y-3">
        {specs.length > 0 && (
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Key (e.g., Weight)" value={spec.key}
                  onChange={(e) => updateSpec(i, "key", e.target.value)} className={`${inputClass} flex-1`} />
                <input type="text" placeholder="Value (e.g., 30 kg)" value={spec.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)} className={`${inputClass} flex-1`} />
                <button type="button" onClick={() => removeSpec(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={addSpec}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-[#EDE9F6]"
          style={{ borderColor: GOLD, color: PURPLE }}>
          + Add Specification
        </button>
        <p className="text-xs text-gray-400">Add technical specs like dimensions, weight, material, certifications, etc.</p>
      </div>

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? "Creating Product..." : "Create Product"}
        </LuxuryButton>
      </div>
    </form>
  );
}

interface NewProductFormProps {
  categories: Category[];
}

interface VariantSlot {
  id: string;
  file: File | null;
  preview: string | null;
  code: string;
  price: string;
  isMaster: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
const MAX_VARIANTS = 5;

function newSlot(isMaster = false): VariantSlot {
  return { id: crypto.randomUUID(), file: null, preview: null, code: "", price: "", isMaster };
}

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

/** Single variant card */
function VariantCard({
  slot, index, onUpdate, onRemove, canRemove,
}: {
  slot: VariantSlot;
  index: number;
  onUpdate: (id: string, patch: Partial<VariantSlot>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Use object URL — no base64 conversion, preserves original quality
    const preview = URL.createObjectURL(file);
    onUpdate(slot.id, { file, preview });
  };

  return (
    <div
      className="relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all"
      style={{
        borderColor: slot.isMaster ? GOLD : slot.preview ? PURPLE : "#e5e7eb",
        boxShadow: slot.isMaster ? `0 0 0 1px ${GOLD}55` : "none",
      }}
    >
      {/* Master badge */}
      {slot.isMaster && (
        <div
          className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: GOLD }}
        >
          <Star className="h-2.5 w-2.5" /> Master
        </div>
      )}

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(slot.id)}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Image zone */}
      <div
        className="relative cursor-pointer group"
        style={{ backgroundColor: "#F5F4F7", minHeight: 160 }}
        onClick={() => fileRef.current?.click()}
      >
        {slot.preview ? (
          <img src={slot.preview} alt="preview" className="w-full h-40 object-contain bg-white" />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl group-hover:opacity-80 transition-opacity" style={{ backgroundColor: "#EDE9F6" }}>
              <Upload className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <p className="text-xs text-gray-400">Click to upload</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Fields */}
      <div className="p-3 space-y-2 bg-white">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            {slot.isMaster ? "Master SKU / Code" : "Variant Code"}
          </label>
          <input
            type="text"
            value={slot.code}
            onChange={(e) => onUpdate(slot.id, { code: e.target.value })}
            placeholder={slot.isMaster ? "e.g. A800" : "e.g. A801"}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow"
          />
        </div>
        {!slot.isMaster && (
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
              Price Override (CAD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={slot.price}
                onChange={(e) => onUpdate(slot.id, { price: e.target.value })}
                placeholder="Leave blank to use master price"
                className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] transition-shadow"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<VariantSlot[]>([newSlot(true)]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const updateVariant = (id: string, patch: Partial<VariantSlot>) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVariant = (id: string) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    setVariants((prev) => [...prev, newSlot(false)]);
  };

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const updated = [...specs];
    updated[i][field] = val;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Specs
    const specObj: Record<string, string> = {};
    specs.forEach(({ key, value }) => { if (key && value) specObj[key] = value; });
    formData.set("specifications", JSON.stringify(specObj));

    // Variants metadata
    const variantsMeta = variants.map((v) => ({
      code: v.code,
      price: v.price ? parseFloat(v.price) : null,
      isMaster: v.isMaster,
    }));
    formData.set("variantsJson", JSON.stringify(variantsMeta));

    // Variant files
    variants.forEach((v, i) => {
      if (v.file) formData.set(`variant_file_${i}`, v.file);
    });

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

      {/* ── MEDIA & VARIANTS ── */}
      <Section title="Product Images & Variants" />

      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          The <span className="font-semibold" style={{ color: GOLD }}>Master</span> slot is your primary product image and SKU.
          Add up to {MAX_VARIANTS - 1} variant images below — each with its own code and optional price.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {variants.map((slot, i) => (
            <VariantCard
              key={slot.id}
              slot={slot}
              index={i}
              onUpdate={updateVariant}
              onRemove={removeVariant}
              canRemove={!slot.isMaster}
            />
          ))}

          {/* Add variant button */}
          {variants.length < MAX_VARIANTS && (
            <button
              type="button"
              onClick={addVariant}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors hover:border-[#4B1D8F] hover:bg-[#EDE9F6]/40 min-h-[200px] gap-2"
              style={{ borderColor: `${GOLD}66` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#EDE9F6" }}>
                <Plus className="h-5 w-5" style={{ color: PURPLE }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: PURPLE }}>Add Variant</span>
              <span className="text-[10px] text-gray-400">{variants.length}/{MAX_VARIANTS}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── DETAILS ── */}
      <Section title="Product Details" />

      <Field label="Product Name" required icon={Tag}>
        <input id="name" name="name" type="text" required className={inputClass} placeholder="e.g., Premium Flooring Collection" />
      </Field>

      <Field label="Description" required icon={FileText}>
        <textarea id="description" name="description" rows={4} required className={`${inputClass} resize-none`}
          placeholder="Describe your product — materials, dimensions, use cases..." />
      </Field>

      {/* ── PRICING ── */}
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

      {/* ── SPECIFICATIONS ── */}
      <Section title="Specifications" />

      <div className="space-y-3">
        {specs.length > 0 && (
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Key (e.g., Weight)" value={spec.key}
                  onChange={(e) => updateSpec(i, "key", e.target.value)} className={`${inputClass} flex-1`} />
                <input type="text" placeholder="Value (e.g., 30 kg)" value={spec.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)} className={`${inputClass} flex-1`} />
                <button type="button" onClick={() => removeSpec(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={addSpec}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors hover:bg-[#EDE9F6]"
          style={{ borderColor: GOLD, color: PURPLE }}>
          + Add Specification
        </button>
        <p className="text-xs text-gray-400">Add technical specs like dimensions, weight, material, certifications, etc.</p>
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: `${GOLD}44` }}>
        <LuxuryButton type="button" variant="outline" size="md" onClick={() => router.back()}>Cancel</LuxuryButton>
        <LuxuryButton type="submit" loading={loading} size="md" className="flex-1">
          {loading ? "Creating Product..." : "Create Product"}
        </LuxuryButton>
      </div>
    </form>
  );
}
