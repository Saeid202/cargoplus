"use client";

import { PageEditor } from "@/components/admin/cms/pages/PageEditor";
import { updatePageContent } from "@/app/actions/cms-pages";

interface PageEditorClientProps {
  slug: string;
  initialContent: string;
}

export function PageEditorClient({ slug, initialContent }: PageEditorClientProps) {
  async function handleSave(html: string) {
    const result = await updatePageContent(slug, html);
    if (result.error) throw new Error(result.error);
  }

  return <PageEditor initialContent={initialContent} onSave={handleSave} />;
}
