"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { createNavItem, updateNavItem } from "@/app/actions/cms-navigation";
import type { NavItemRow, NavItemFormData } from "@/types/cms";

interface NavItemFormProps {
  navItem?: NavItemRow | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}

export function NavItemForm({ navItem, nextPosition, onClose, onSaved }: NavItemFormProps) {
  const [form, setForm] = useState<NavItemFormData>({
    label: navItem?.label ?? "",
    href: navItem?.href ?? "",
    position: navItem?.position ?? nextPosition,
    is_active: navItem?.is_active ?? true,
    open_in_new_tab: navItem?.open_in_new_tab ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NavItemFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (key: keyof NavItemFormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.label.trim()) e.label = "Label is required";
    if (!form.href.trim()) e.href = "URL is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError("");
    const result = navItem
      ? await updateNavItem(navItem.id, form)
      : await createNavItem(form);
    setSaving(false);
    if (result.error) { setServerError(result.error); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {navItem ? "Edit Custom Link" : "Add Custom Link"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{serverError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="e.g. Blog"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              value={form.href}
              onChange={(e) => set("href", e.target.value)}
              placeholder="/blog or https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.href && <p className="mt-1 text-xs text-red-500">{errors.href}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="number"
              min={0}
              value={form.position}
              onChange={(e) => set("position", parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <Toggle
              checked={form.open_in_new_tab}
              onChange={(v) => set("open_in_new_tab", v)}
              label="Open in new tab"
            />
            <Toggle
              checked={form.is_active}
              onChange={(v) => set("is_active", v)}
              label="Active"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : navItem ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
