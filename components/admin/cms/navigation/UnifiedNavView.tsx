"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { NavItemRow as NavItemRowComponent } from "./NavItemRow";
import { PageNavRow } from "./PageNavRow";
import { NavItemForm } from "./NavItemForm";
import { reorderNavItems, updatePageNavAssignment } from "@/app/actions/cms-navigation";
import type { NavItemRow, PageContentRow } from "@/types/cms";

interface UnifiedNavViewProps {
  initialNavItems: NavItemRow[];
  initialPages: PageContentRow[];
}

export function UnifiedNavView({ initialNavItems, initialPages }: UnifiedNavViewProps) {
  const [navItems, setNavItems] = useState<NavItemRow[]>(initialNavItems);
  const [pages, setPages] = useState<PageContentRow[]>(initialPages);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItemRow | null>(null);
  const [hiddenExpanded, setHiddenExpanded] = useState(false);

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  const navPages = pages.filter((p) => p.show_in_nav);
  const hiddenPages = pages.filter((p) => !p.show_in_nav);

  const activeCount = navPages.length + navItems.filter((n) => n.is_active).length;

  async function handlePageDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(navPages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // Update nav_position for each
    await Promise.all(
      reordered.map((p, i) => updatePageNavAssignment(p.slug, { nav_position: i }))
    );
    // Optimistic update
    const updatedPages = pages.map((p) => {
      const idx = reordered.findIndex((r) => r.id === p.id);
      if (idx !== -1) return { ...p, nav_position: idx };
      return p;
    });
    setPages(updatedPages);
  }

  async function handleNavItemDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(navItems);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setNavItems(reordered);
    await reorderNavItems(reordered.map((n) => n.id));
  }

  async function handleNavItemMoveUp(index: number) {
    if (index === 0) return;
    const reordered = Array.from(navItems);
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setNavItems(reordered);
    await reorderNavItems(reordered.map((n) => n.id));
  }

  async function handleNavItemMoveDown(index: number) {
    if (index === navItems.length - 1) return;
    const reordered = Array.from(navItems);
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setNavItems(reordered);
    await reorderNavItems(reordered.map((n) => n.id));
  }

  return (
    <div className="space-y-8">
      {/* Summary bar */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium text-green-600">{activeCount}</span>
        <span>active nav entries total</span>
      </div>

      {/* Page Links section */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Page Links
        </h2>
        {navPages.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No pages are set to show in nav.</p>
        ) : (
          <DragDropContext onDragEnd={handlePageDragEnd}>
            <Droppable droppableId="page-links">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {navPages.map((page, index) => (
                    <Draggable key={page.id} draggableId={page.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "opacity-80 shadow-lg" : ""}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab text-gray-300 hover:text-gray-500 select-none text-lg leading-none"
                            >
                              ⠿
                            </div>
                            <div className="flex-1">
                              <PageNavRow page={page} onChanged={refresh} showNavControls />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </section>

      {/* Hidden Pages collapsible */}
      <section>
        <button
          onClick={() => setHiddenExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 hover:text-gray-700 transition-colors"
        >
          {hiddenExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Hidden Pages ({hiddenPages.length})
        </button>
        {hiddenExpanded && (
          <div className="space-y-2">
            {hiddenPages.length === 0 ? (
              <p className="text-sm text-gray-400 italic">All pages are visible in nav.</p>
            ) : (
              hiddenPages.map((page) => (
                <PageNavRow key={page.id} page={page} onChanged={refresh} showNavControls={false} />
              ))
            )}
          </div>
        )}
      </section>

      {/* Custom Links section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Custom Links
          </h2>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Custom Link
          </button>
        </div>

        {navItems.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No custom links yet.</p>
        ) : (
          <DragDropContext onDragEnd={handleNavItemDragEnd}>
            <Droppable droppableId="custom-links">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {navItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "opacity-80 shadow-lg" : ""}
                        >
                          <NavItemRowComponent
                            navItem={item}
                            onEdit={(i) => { setEditingItem(i); setFormOpen(true); }}
                            onChanged={refresh}
                            onMoveUp={() => handleNavItemMoveUp(index)}
                            onMoveDown={() => handleNavItemMoveDown(index)}
                            isFirst={index === 0}
                            isLast={index === navItems.length - 1}
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
        )}
      </section>

      {/* Form modal */}
      {formOpen && (
        <NavItemForm
          navItem={editingItem}
          nextPosition={navItems.length}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}
