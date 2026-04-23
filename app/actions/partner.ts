"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Partner, EngineeringQuote, EngineeringQuoteFile } from "@/types/database";
import type { EngineeringProjectRow } from "@/app/actions/engineering";

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface PartnerDashboardStats {
  total: number;
  pending: number;
  responded: number;
}

export async function getPartnerDashboardStats(): Promise<{
  data: PartnerDashboardStats | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    // Fetch all projects and this partner's quotes in parallel
    const [projectsResult, quotesResult] = await Promise.all([
      supabase.from("engineering_projects").select("id"),
      supabase.from("engineering_quotes").select("project_id").eq("partner_id", user.id),
    ]);

    if (projectsResult.error) return { data: null, error: projectsResult.error.message };

    const total = (projectsResult.data ?? []).length;
    const respondedProjectIds = new Set(
      (quotesResult.data ?? []).map((q: any) => q.project_id)
    );
    const responded = respondedProjectIds.size;
    const pending = total - responded;

    return { data: { total, pending, responded }, error: null };
  } catch {
    return { data: null, error: "Failed to fetch dashboard stats" };
  }
}

// ── Projects list ─────────────────────────────────────────────────────────────

export interface PartnerProjectRow extends EngineeringProjectRow {
  has_quote: boolean;
}

export async function getAllProjectsForPartner(): Promise<{
  data: PartnerProjectRow[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const [projectsResult, quotesResult] = await Promise.all([
      supabase
        .from("engineering_projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("engineering_quotes")
        .select("project_id")
        .eq("partner_id", user.id),
    ]);

    if (projectsResult.error) return { data: [], error: projectsResult.error.message };

    const quotedIds = new Set(
      (quotesResult.data ?? []).map((q: any) => q.project_id)
    );

    const data: PartnerProjectRow[] = (projectsResult.data ?? []).map((p: any) => ({
      ...p,
      has_quote: quotedIds.has(p.id),
    }));

    return { data, error: null };
  } catch {
    return { data: [], error: "Failed to fetch projects" };
  }
}

// ── Project detail ────────────────────────────────────────────────────────────

export interface DrawingWithUrl {
  id: string;
  file_name: string;
  storage_path: string;
  signed_url: string | null;
}

export interface ProjectDetailForPartner {
  project: EngineeringProjectRow;
  drawings: DrawingWithUrl[];
  existing_quote: EngineeringQuote | null;
  quote_files: EngineeringQuoteFile[];
}

export async function getProjectDetailForPartner(projectId: string): Promise<{
  data: ProjectDetailForPartner | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const [projectResult, drawingsResult, quoteResult] = await Promise.all([
      supabase.from("engineering_projects").select("*").eq("id", projectId).single(),
      supabase.from("engineering_project_drawings").select("*").eq("project_id", projectId),
      supabase
        .from("engineering_quotes")
        .select("*")
        .eq("project_id", projectId)
        .eq("partner_id", user.id)
        .maybeSingle(),
    ]);

    if (projectResult.error) return { data: null, error: projectResult.error.message };

    // Generate signed URLs for drawings
    const drawings: DrawingWithUrl[] = await Promise.all(
      (drawingsResult.data ?? []).map(async (d: any) => {
        const { data: signed } = await supabase.storage
          .from("engineering-drawings")
          .createSignedUrl(d.storage_path, 3600);
        return {
          id: d.id,
          file_name: d.file_name,
          storage_path: d.storage_path,
          signed_url: signed?.signedUrl ?? null,
        };
      })
    );

    // Fetch quote files if quote exists
    let quoteFiles: EngineeringQuoteFile[] = [];
    if (quoteResult.data) {
      const { data: files } = await supabase
        .from("engineering_quote_files")
        .select("*")
        .eq("quote_id", quoteResult.data.id);
      quoteFiles = (files ?? []) as EngineeringQuoteFile[];
    }

    return {
      data: {
        project: projectResult.data as EngineeringProjectRow,
        drawings,
        existing_quote: (quoteResult.data as EngineeringQuote) ?? null,
        quote_files: quoteFiles,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Failed to fetch project detail" };
  }
}

// ── Quote submission ──────────────────────────────────────────────────────────

export interface SubmitQuoteInput {
  price_cad: number;
  timeline_weeks: number;
  validity_days: number;
  notes?: string | null;
}

export async function submitQuote(
  projectId: string,
  input: SubmitQuoteInput,
  files: { name: string; base64: string; type: string }[]
): Promise<{ data: EngineeringQuote | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    // Upsert quote (unique constraint on project_id + partner_id)
    const { data: quote, error: quoteError } = await supabase
      .from("engineering_quotes")
      .upsert(
        {
          project_id: projectId,
          partner_id: user.id,
          price_cad: input.price_cad,
          timeline_weeks: input.timeline_weeks,
          validity_days: input.validity_days,
          notes: input.notes ?? null,
          status: "submitted",
        },
        { onConflict: "project_id,partner_id" }
      )
      .select()
      .single();

    if (quoteError || !quote) {
      return { data: null, error: quoteError?.message ?? "Failed to save quote" };
    }

    // Upload files to engineering-drawings bucket under partner/ prefix
    for (const file of files) {
      const storagePath = `partner/${user.id}/${quote.id}/${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from("engineering-drawings")
        .upload(storagePath, bytes, { contentType: file.type, upsert: true });

      if (!uploadError) {
        await supabase.from("engineering_quote_files").insert({
          quote_id: quote.id,
          file_name: file.name,
          storage_path: storagePath,
        });
      } else {
        console.error("Quote file upload error:", uploadError.message);
      }
    }

    return { data: quote as EngineeringQuote, error: null };
  } catch {
    return { data: null, error: "Failed to submit quote" };
  }
}

// ── Partner profile ───────────────────────────────────────────────────────────

export async function getPartnerProfile(): Promise<{
  data: Partner | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Partner, error: null };
  } catch {
    return { data: null, error: "Failed to fetch profile" };
  }
}

export interface UpdatePartnerProfileInput {
  company_name: string;
  contact_name: string;
  phone?: string | null;
  country: string;
}

export async function updatePartnerProfile(
  input: UpdatePartnerProfileInput
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("partners")
      .update({
        company_name: input.company_name,
        contact_name: input.contact_name,
        phone: input.phone ?? null,
        country: input.country,
      })
      .eq("id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "Failed to update profile" };
  }
}
