"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteSlide, toggleSlideActive } from "@/app/actions/cms-sliders";
import type { HeroSlideRow } from "@/types/cms";

interface SlideCardProps {
  slide: HeroSlideRow;
  onEdit: (slide: HeroSlideRow) => void;
  onDeleted: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function SlideCard({
  slide, onEdit, onDeleted, onMoveUp, onMoveDown, isFirst, isLast, dragHandleProps,
}: SlideCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleToggle(val: boolean) {
    setToggling(true);
    await toggleSlideActive(slide.id, val);
    setToggling(false);
    onDeleted();
  }

  async function handleDelete() {
    const result = await deleteSlide(slide.id);
    console.log("[handleDelete] result:", result);
    if (result.error) {
      setConfirmOpen(false);
      setDeleteError(result.error);
      return;
    }
    setConfirmOpen(false);
    onDeleted();
  }

  return (
    <>
      <div className={`relative flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-opacity ${!slide.is_active ? "opacity-50" : ""}`}>
        {deleteError && (
          <div className="absolute top-2 right-2 rounded-lg bg-red-50 px-3 py-1 text-xs text-red-600">{deleteError}</div>
        )}
        {/* Drag handle */}
        <div {...dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-500 select-none text-lg leading-none">
          ⠿
        </div>

        {/* Thumbnail */}
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {slide.image_url ? (
            <Image src={slide.image_url} alt={slide.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 text-xs">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
          {slide.cta_text && <p className="text-xs text-gray-500 mt-0.5">CTA: {slide.cta_text}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Position {slide.position}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              slide.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {slide.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Touch reorder fallback */}
          <div className="flex flex-col gap-0.5 md:hidden">
            <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <Toggle checked={slide.is_active} onChange={handleToggle} disabled={toggling} />

          <button onClick={() => onEdit(slide)}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Slide"
        message={`Are you sure you want to delete "${slide.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
