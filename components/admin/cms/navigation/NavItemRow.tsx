"use client";

import { useState } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteNavItem, toggleNavItemActive } from "@/app/actions/cms-navigation";
import type { NavItemRow } from "@/types/cms";

interface NavItemRowProps {
  navItem: NavItemRow;
  onEdit: (item: NavItemRow) => void;
  onChanged: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function NavItemRow({
  navItem, onEdit, onChanged, onMoveUp, onMoveDown, isFirst, isLast, dragHandleProps,
}: NavItemRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleToggle(val: boolean) {
    setToggling(true);
    await toggleNavItemActive(navItem.id, val);
    setToggling(false);
    onChanged();
  }

  async function handleDelete() {
    await deleteNavItem(navItem.id);
    setConfirmOpen(false);
    onChanged();
  }

  const truncatedHref = navItem.href.length > 40
    ? navItem.href.slice(0, 40) + "…"
    : navItem.href;

  return (
    <>
      <div className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm transition-opacity ${!navItem.is_active ? "opacity-50" : ""}`}>
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab text-gray-300 hover:text-gray-500 select-none text-lg leading-none shrink-0"
        >
          ⠿
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm">{navItem.label}</span>
            {navItem.open_in_new_tab && (
              <span title="Opens in new tab">
                <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              navItem.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {navItem.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{truncatedHref}</p>
        </div>

        {/* Position badge */}
        <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          #{navItem.position}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Touch reorder fallback */}
          <div className="flex flex-col gap-0.5 md:hidden">
            <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronUp className="h-3 w-3" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <Toggle checked={navItem.is_active} onChange={handleToggle} disabled={toggling} />

          <button
            onClick={() => onEdit(navItem)}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Custom Link"
        message={`Delete "${navItem.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
