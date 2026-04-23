"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageTreeNode } from "./PageTreeNode";
import { PageForm } from "./PageForm";
import { getParentPages } from "@/app/actions/cms-pages";
import type { PageTreeNode as PageTreeNodeType, PageContentRow } from "@/types/cms";

interface PageTreeProps {
  initialPages: PageTreeNodeType[];
}

export function PageTree({ initialPages }: PageTreeProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [parentPages, setParentPages] = useState<PageContentRow[]>([]);
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function openAddPage(parentId?: string) {
    const result = await getParentPages();
    setParentPages(result.data ?? []);
    setPreselectedParentId(parentId ?? null);
    setFormOpen(true);
  }

  function handleSaved(slug: string) {
    setFormOpen(false);
    router.push(`/admin/cms/pages/${slug}`);
  }

  return (
    <div>
      {/* Header actions */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => openAddPage()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Page
        </button>
      </div>

      {/* Empty state */}
      {initialPages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500 mb-4">No pages yet. Create your first page.</p>
          <button
            onClick={() => openAddPage()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create First Page
          </button>
        </div>
      )}

      {/* Page tree */}
      <div className="space-y-3">
        {initialPages.map((page) => (
          <div key={page.id}>
            <PageTreeNode
              page={page}
              onEdit={(slug) => router.push(`/admin/cms/pages/${slug}`)}
              onDeleted={refresh}
              onAddChild={(parentId) => openAddPage(parentId)}
            />
            {/* Children */}
            {page.children.length > 0 && (
              <div className="mt-2 space-y-2 pl-8 border-l-2 border-gray-200 ml-4">
                {page.children.map((child) => (
                  <PageTreeNode
                    key={child.id}
                    page={child}
                    isChild
                    onEdit={(slug) => router.push(`/admin/cms/pages/${slug}`)}
                    onDeleted={refresh}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form modal */}
      {formOpen && (
        <PageForm
          parentPages={parentPages}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
