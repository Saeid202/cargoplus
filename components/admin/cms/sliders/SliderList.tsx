"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { SlideCard } from "./SlideCard";
import { SlideForm } from "./SlideForm";
import { reorderSlides } from "@/app/actions/cms-sliders";
import type { HeroSlideRow } from "@/types/cms";

interface SliderListProps {
  initialSlides: HeroSlideRow[];
}

export function SliderList({ initialSlides }: SliderListProps) {
  const [slides, setSlides] = useState<HeroSlideRow[]>(initialSlides);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideRow | null>(null);

  const refresh = useCallback(async () => {
    // Re-fetch from server by reloading the page data
    window.location.reload();
  }, []);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(slides);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSlides(reordered);
    await reorderSlides(reordered.map((s) => s.id));
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const reordered = Array.from(slides);
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setSlides(reordered);
    await reorderSlides(reordered.map((s) => s.id));
  }

  async function handleMoveDown(index: number) {
    if (index === slides.length - 1) return;
    const reordered = Array.from(slides);
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setSlides(reordered);
    await reorderSlides(reordered.map((s) => s.id));
  }

  const activeCount = slides.filter((s) => s.is_active).length;

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{slides.length} slide{slides.length !== 1 ? "s" : ""}</span>
          <span className="text-gray-300">·</span>
          <span className="text-green-600 font-medium">{activeCount} active</span>
        </div>
        <button
          onClick={() => { setEditingSlide(null); setFormOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </div>

      {/* Empty state */}
      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500 mb-4">No slides yet. Add your first slide to get started.</p>
          <button
            onClick={() => { setEditingSlide(null); setFormOpen(true); }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add First Slide
          </button>
        </div>
      )}

      {/* Drag-drop list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={snapshot.isDragging ? "opacity-80 shadow-lg" : ""}
                    >
                      <SlideCard
                        slide={slide}
                        onEdit={(s) => { setEditingSlide(s); setFormOpen(true); }}
                        onDeleted={refresh}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        isFirst={index === 0}
                        isLast={index === slides.length - 1}
                        dragHandleProps={provided.dragHandleProps ?? undefined}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Form modal */}
      {formOpen && (
        <SlideForm
          slide={editingSlide}
          nextPosition={slides.length}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}
