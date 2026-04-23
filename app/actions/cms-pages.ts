"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePage, revalidateAllPublic } from "./cms-revalidate";
import type { PageFormData, ActionResult, PageContentRow, PageTreeNode } from "@/types/cms";

function buildPageTree(pages: PageContentRow[]): PageTreeNode[] {
  const parents = pages.filter((p) => p.parent_id === null);
  return parents.map((parent) => ({
    ...parent,
    children: pages.filter((p) => p.parent_id === parent.id),
  }));
}

export async function getPageTree(): Promise<ActionResult<PageTreeNode[]>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .order("nav_position", { ascending: true, nullsFirst: false });
    if (error) return { data: null, error: error.message };
    return { data: buildPageTree(data as PageContentRow[]), error: null };
  } catch {
    return { data: null, error: "Failed to fetch page tree" };
  }
}

export async function getPageBySlug(slug: string): Promise<ActionResult<PageContentRow>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as PageContentRow, error: null };
  } catch {
    return { data: null, error: "Failed to fetch page" };
  }
}

export async function getParentPages(): Promise<ActionResult<PageContentRow[]>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .is("parent_id", null)
      .order("title", { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data: data as PageContentRow[], error: null };
  } catch {
    return { data: null, error: "Failed to fetch parent pages" };
  }
}

export async function createPage(formData: PageFormData): Promise<ActionResult<PageContentRow>> {
  try {
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return { data: null, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
    }
    const supabase = createAdminClient();
    if (formData.parent_id) {
      const { data: parent } = await supabase
        .from("page_contents")
        .select("parent_id")
        .eq("id", formData.parent_id)
        .single();
      if ((parent as any)?.parent_id) {
        return { data: null, error: "Child pages cannot have their own children" };
      }
    }
    const { data, error } = await supabase
      .from("page_contents")
      .insert({ slug: formData.slug, title: formData.title, content: "", parent_id: formData.parent_id })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") return { data: null, error: "A page with this slug already exists" };
      return { data: null, error: error.message };
    }
    await revalidatePage(formData.slug);
    return { data: data as PageContentRow, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to create page" };
  }
}

export async function updatePageMeta(
  slug: string,
  fields: Partial<Pick<PageFormData, "title" | "parent_id">>
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("page_contents").update(fields).eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidatePage(slug);
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to update page" };
  }
}

export async function updatePageContent(slug: string, content: string): Promise<ActionResult> {
  try {
    if (!content || content.trim() === "" || content === "<p></p>") {
      return { data: null, error: "Page content cannot be empty" };
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("page_contents").update({ content }).eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidatePage(slug);
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to save page content" };
  }
}

export async function deletePage(slug: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { data: page } = await supabase
      .from("page_contents")
      .select("id, is_protected")
      .eq("slug", slug)
      .single();
    if (!page) return { data: null, error: "Page not found" };
    if ((page as any).is_protected) return { data: null, error: "This page is protected and cannot be deleted" };
    const { data: children } = await supabase
      .from("page_contents")
      .select("id, title")
      .eq("parent_id", (page as any).id);
    if (children && children.length > 0) {
      const names = (children as any[]).map((c) => c.title).join(", ");
      return { data: null, error: `Cannot delete: reassign or delete child pages first (${names})` };
    }
    const { error } = await supabase.from("page_contents").delete().eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidatePage(slug);
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to delete page" };
  }
}
  const parents = pages.filter((p) => p.parent_id === null);
  return parents.map((parent) => ({
    ...parent,
    children: pages.filter((p) => p.parent_id === parent.id),
  }));
}

export async function getPageTree(): Promise<ActionResult<PageTreeNode[]>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .order("nav_position", { ascending: true, nullsFirst: false });
    if (error) return { data: null, error: error.message };
    return { data: buildPageTree(data), error: null };
  } catch {
    return { data: null, error: "Failed to fetch page tree" };
  }
}

export async function getPageBySlug(slug: string): Promise<ActionResult<PageContentRow>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("*")
      .eq("slug", slug)
      .single();
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch page" };
  }
}

export async function getParentPages(): Promise<ActionResult<PageContentRow[]>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("id, slug, title, parent_id, show_in_nav, nav_label, nav_position, is_protected, content, created_at, updated_at")
      .is("parent_id", null)
      .order("title", { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch {
    return { data: null, error: "Failed to fetch parent pages" };
  }
}

export async function createPage(formData: PageFormData): Promise<ActionResult<PageContentRow>> {
  try {
    const supabase = await verifyAdmin();

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return { data: null, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
    }

    // Check depth: if parent has a parent, reject
    if (formData.parent_id) {
      const { data: parent } = await supabase
        .from("page_contents")
        .select("parent_id")
        .eq("id", formData.parent_id)
        .single();
      if (parent?.parent_id) {
        return { data: null, error: "Child pages cannot have their own children" };
      }
    }

    const { data, error } = await supabase
      .from("page_contents")
      .insert({
        slug: formData.slug,
        title: formData.title,
        content: "",
        parent_id: formData.parent_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return { data: null, error: "A page with this slug already exists" };
      return { data: null, error: error.message };
    }

    await revalidatePage(formData.slug);
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to create page" };
  }
}

export async function updatePageMeta(
  slug: string,
  fields: Partial<Pick<PageFormData, "title" | "parent_id">>
): Promise<ActionResult> {
  try {
    const supabase = await verifyAdmin();
    const { error } = await supabase
      .from("page_contents")
      .update(fields)
      .eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidatePage(slug);
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to update page" };
  }
}

export async function updatePageContent(slug: string, content: string): Promise<ActionResult> {
  try {
    if (!content || content.trim() === "" || content === "<p></p>") {
      return { data: null, error: "Page content cannot be empty" };
    }
    const supabase = await verifyAdmin();
    const { error } = await supabase
      .from("page_contents")
      .update({ content })
      .eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidatePage(slug);
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to save page content" };
  }
}

export async function deletePage(slug: string): Promise<ActionResult> {
  try {
    const supabase = await verifyAdmin();

    // Check protected
    const { data: page } = await supabase
      .from("page_contents")
      .select("id, is_protected")
      .eq("slug", slug)
      .single();

    if (!page) return { data: null, error: "Page not found" };
    if (page.is_protected) return { data: null, error: "This page is protected and cannot be deleted" };

    // Check for children
    const { data: children } = await supabase
      .from("page_contents")
      .select("id, title")
      .eq("parent_id", page.id);

    if (children && children.length > 0) {
      const names = children.map((c) => c.title).join(", ");
      return { data: null, error: `Cannot delete: reassign or delete child pages first (${names})` };
    }

    const { error } = await supabase.from("page_contents").delete().eq("slug", slug);
    if (error) return { data: null, error: error.message };

    await revalidatePage(slug);
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to delete page" };
  }
}
