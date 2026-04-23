"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPage, updatePageMeta } from "@/app/actions/cms-pages";
import type { PageContentRow, PageFormData } from "@/types/cms";

interface PageFormProps {
  page?: PageContentRow | null;
  parentPages: PageContentRow[];
  onClose: () => void;
  onSaved: (slug: string) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PageForm({ page, parentPages, onClose, onSaved }: PageFormProps) {
  const [form, setForm] = useState<PageFormData>({
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    parent_id: page?.parent_id ?? null,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page);
  const [errors, setErrors] = useState<Partial<Record<keyof PageFormData | "server", string>>>({});
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && !page) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited, page]);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) {
      e.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      e.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const result = page
      ? await updatePageMeta(page.slug, { title: form.title, parent_id: form.parent_id })
      : await createPage(form);
    setSaving(false);
    if (result.error) {
      setErrors((prev) => ({ ...prev, server: result.error! }));
      return;
    }
    onSaved(page ? page.slug : form.slug);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {page ? "Edit Page" : "New Page"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.server && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{errors.server}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. About Us"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              placeholder="about-us"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
            <p className="mt-1 text-xs text-gray-400">
              Lowercase letters, numbers, and hyphens only. URL: /{form.slug || "…"}
            </p>
          </div>

          {!page && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Page</label>
              <select
                value={form.parent_id ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, parent_id: e.target.value || null }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (top-level)</option>
                {parentPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {saving ? "Saving…" : page ? "Save Changes" : "Create Page"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
