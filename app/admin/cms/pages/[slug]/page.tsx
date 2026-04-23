import { notFound } from "next/navigation";
import Link from "next/link";
import { getPageBySlug } from "@/app/actions/cms-pages";
import { PageEditorClient } from "./PageEditorClient";

interface PageEditorPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PageEditorPage({ params }: PageEditorPageProps) {
  const { slug } = await params;
  const result = await getPageBySlug(slug);

  if (!result.data) {
    notFound();
  }

  const page = result.data;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/cms/pages" className="hover:text-blue-600 transition-colors">
          Page Manager
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{page.title}</span>
      </nav>

      {/* Page metadata */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500 font-mono">
          /{page.slug}
        </span>
        {page.is_protected && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Protected
          </span>
        )}
      </div>

      <PageEditorClient slug={slug} initialContent={page.content} />
    </div>
  );
}
