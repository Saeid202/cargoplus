import { getPageTree } from "@/app/actions/cms-pages";
import { PageTree } from "@/components/admin/cms/pages/PageTree";

export default async function PagesPage() {
  const result = await getPageTree();
  const pages = result.data ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Page Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage CMS pages. Edit content by clicking the edit button on any page.
        </p>
      </div>
      <PageTree initialPages={pages} />
    </div>
  );
}
