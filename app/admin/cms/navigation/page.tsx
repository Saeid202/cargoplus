import { getNavItems, getAllPagesForNav } from "@/app/actions/cms-navigation";
import { UnifiedNavView } from "@/components/admin/cms/navigation/UnifiedNavView";

export default async function NavigationPage() {
  const [navResult, pagesResult] = await Promise.all([
    getNavItems(),
    getAllPagesForNav(),
  ]);

  const navItems = navResult.data ?? [];
  const pages = pagesResult.data ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control which pages and links appear in the site navigation.
        </p>
      </div>
      <UnifiedNavView initialNavItems={navItems} initialPages={pages} />
    </div>
  );
}
