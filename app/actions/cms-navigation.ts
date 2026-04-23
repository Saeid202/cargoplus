"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateAllPublic } from "./cms-revalidate";
import type { NavItemFormData, PageNavAssignment, ActionResult, NavItemRow, PageContentRow } from "@/types/cms";

export async function getNavItems(): Promise<ActionResult<NavItemRow[]>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("nav_items")
      .select("*")
      .order("position", { ascending: true });
    if (error) return { data: null, error: error.message };
    return { data: data as NavItemRow[], error: null };
  } catch {
    return { data: null, error: "Failed to fetch nav items" };
  }
}

export async function getAllPagesForNav(): Promise<ActionResult<PageContentRow[]>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("id, slug, title, show_in_nav, nav_label, nav_position, parent_id, is_protected, content, created_at, updated_at")
      .order("nav_position", { ascending: true, nullsFirst: false });
    if (error) return { data: null, error: error.message };
    return { data: data as PageContentRow[], error: null };
  } catch {
    return { data: null, error: "Failed to fetch pages for nav" };
  }
}

export async function createNavItem(formData: NavItemFormData): Promise<ActionResult<NavItemRow>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("nav_items").insert(formData).select().single();
    if (error) return { data: null, error: error.message };
    await revalidateAllPublic();
    return { data: data as NavItemRow, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to create nav item" };
  }
}

export async function updateNavItem(id: string, formData: NavItemFormData): Promise<ActionResult<NavItemRow>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("nav_items").update(formData).eq("id", id).select().single();
    if (error) return { data: null, error: error.message };
    await revalidateAllPublic();
    return { data: data as NavItemRow, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to update nav item" };
  }
}

export async function deleteNavItem(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("nav_items").delete().eq("id", id);
    if (error) return { data: null, error: error.message };
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to delete nav item" };
  }
}

export async function reorderNavItems(orderedIds: string[]): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("nav_items").update({ position: index }).eq("id", id)
      )
    );
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to reorder nav items" };
  }
}

export async function toggleNavItemActive(id: string, is_active: boolean): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("nav_items").update({ is_active }).eq("id", id);
    if (error) return { data: null, error: error.message };
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to toggle nav item" };
  }
}

export async function updatePageNavAssignment(
  slug: string,
  fields: Partial<PageNavAssignment>
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("page_contents").update(fields).eq("slug", slug);
    if (error) return { data: null, error: error.message };
    await revalidateAllPublic();
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Failed to update page nav assignment" };
  }
}
