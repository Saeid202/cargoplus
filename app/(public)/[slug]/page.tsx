import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("page_contents" as any)
      .select("slug");
    return ((data as { slug: string }[]) ?? []).map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

interface CmsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  const supabase = await createServerClient();
  const { data: page } = await supabase
    .from("page_contents" as any)
    .select("title, content")
    .eq("slug", slug)
    .single();

  const typedPage = page as { title: string; content: string } | null;

  if (!typedPage) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{typedPage.title}</h1>
      <div
        className="prose prose-lg max-w-3xl"
        dangerouslySetInnerHTML={{ __html: typedPage.content }}
      />
    </div>
  );
}
