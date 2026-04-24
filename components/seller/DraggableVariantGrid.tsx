"use client";

import { useRef, useState } from "react";
import { X, Upload, Star, Plus, GripVertical } from "lucide-react";

export interface VariantSlot {
  id: string;
  file: File | null;
  preview: string | null;
  existingUrl?: string | null;
  code: string;
  price: string;
  isMaster: boolean;
}

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";
export const MAX_VARIANTS = 5;

export function newSlot(isMaster = false): VariantSlot {
  return {
    id: crypto.randomUUID(),
    file: null,
    preview: null,
    existingUrl: null,
    code: "",
    price: "",
    isMaster,
  };
}

interface Props {
  variants: VariantSlot[];
  onChange: (variants: VariantSlot[]) => void;
}

export function DraggableVariantGrid({ variants, onChange }: Props) {
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Reorder and reassign isMaster (first slot is always master)
  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...variants];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    // First slot is always master
    onChange(next.map((v, i) => ({ ...v, isMaster: i === 0 })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Ghost image — use the card itself
    e.dataTransfer.setDragImage(e.currentTarget, 60, 60);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex.current !== null) reorder(dragIndex.current, index);
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const updateVariant = (id: string, patch: Partial<VariantSlot>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVariant = (id: string) =>
    onChange(
      variants
        .filter((v) => v.id !== id)
        .map((v, i) => ({ ...v, isMaster: i === 0 }))
    );

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    onChange([...variants, newSlot(false)]);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        The{" "}
        <span className="font-semibold" style={{ color: GOLD }}>
          Master
        </span>{" "}
        slot is your primary image and SKU. Drag cards to reorder — the first card is always the master.
        Add up to {MAX_VARIANTS - 1} variants.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {variants.map((slot, i) => (
          <VariantCard
            key={slot.id}
            slot={slot}
            index={i}
            isDragOver={dragOver === i}
            onUpdate={updateVariant}
            onRemove={removeVariant}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}

        {/* Add variant */}
        {variants.length < MAX_VARIANTS && (
          <button
            type="button"
            onClick={addVariant}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors hover:border-[#4B1D8F] hover:bg-[#EDE9F6]/40 min-h-[200px] gap-2"
            style={{ borderColor: `${GOLD}66` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#EDE9F6" }}
            >
              <Plus className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: PURPLE }}>
              Add Variant
            </span>
            <span className="text-[10px] text-gray-400">
              {variants.length}/{MAX_VARIANTS}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  slot: VariantSlot;
  index: number;
  isDragOver: boolean;
  onUpdate: (id: string, patch: Partial<VariantSlot>) => void;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (e: React.DragEvent, i: number) => void;
  onDragEnd: () => void;
}

function VariantCard({
  slot, index, isDragOver,
  onUpdate, onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: CardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const displayImage = slot.preview ?? slot.existingUrl ?? null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate(slot.id, { file, preview: URL.createObjectURL(file) });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className="relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 select-none"
      style={{
        borderColor: isDragOver
          ? PURPLE
          : slot.isMaster
          ? GOLD
          : displayImage
          ? `${PURPLE}88`
          : "#e5e7eb",
        boxShadow: isDragOver
          ? `0 0 0 3px ${PURPLE}44, 0 8px 24px rgba(75,29,143,0.2)`
          : slot.isMaster
          ? `0 0 0 1px ${GOLD}55`
          : "none",
        opacity: isDragOver ? 0.85 : 1,
        transform: isDragOver ? "scale(1.02)" : "scale(1)",
        cursor: "grab",
      }}
    >
      {/* Drag handle */}
      <div
        className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        title="Drag to reorder"
      >
        <GripVertical className="h-3 w-3 text-white" />
        <span className="text-[9px] font-bold text-white">{index + 1}</span>
      </div>

      {/* Master badge */}
      {slot.isMaster && (
        <div
          className="absolute top-2 left-10 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: GOLD }}
        >
          <Star className="h-2.5 w-2.5" /> Master
        </div>
      )}

      {/* Remove */}
      {!slot.isMaster && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }}
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Image zone */}
      <div
        className="relative group"
        style={{ backgroundColor: "#F5F4F7", minHeight: 160 }}
        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="preview"
            className="w-full h-40 object-contain bg-white"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2 cursor-pointer">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl group-hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#EDE9F6" }}
            >
              <Upload className="h-5 w-5" style={{ color: PURPLE }} />
            </div>
            <p className="text-xs text-gray-400">Click to upload</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Fields */}
      <div className="p-3 space-y-2 bg-white" onClick={(e) => e.stopPropagation()}>
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
