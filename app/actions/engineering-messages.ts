"use server";

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MessageFile {
  id: string;
  file_name: string;
  storage_path: string;
  signed_url?: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string | null;
  sender_role: "customer" | "partner";
  message: string | null;
  is_read: boolean;
  created_at: string;
  files: MessageFile[];
}

// ── Customer: fetch messages for a project ───────────────────────────────────
export async function getProjectMessages(projectId: string): Promise<{
  data: ProjectMessage[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data: messages, error } = await supabase
      .from("engineering_project_messages")
      .select("*, engineering_message_files(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };

    // Generate signed URLs for files
    const result: ProjectMessage[] = await Promise.all(
      (messages ?? []).map(async (msg: any) => {
        const files: MessageFile[] = await Promise.all(
          (msg.engineering_message_files ?? []).map(async (f: any) => {
            const { data: signed } = await supabase.storage
              .from("engineering-drawings")
              .createSignedUrl(f.storage_path, 3600);
            return { id: f.id, file_name: f.file_name, storage_path: f.storage_path, signed_url: signed?.signedUrl };
          })
        );
        return { ...msg, files };
      })
    );

    return { data: result, error: null };
  } catch {
    return { data: [], error: "Failed to fetch messages" };
  }
}

// ── Customer: send a message ─────────────────────────────────────────────────
export async function sendCustomerMessage(
  projectId: string,
  message: string | null,
  attachments: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: msg, error: msgError } = await supabase
      .from("engineering_project_messages")
      .insert({ project_id: projectId, sender_id: user.id, sender_role: "customer", message, is_read: true })
      .select("id")
      .single();

    if (msgError || !msg) return { error: msgError?.message ?? "Failed to send" };

    await uploadMessageFiles(supabase, msg.id, user.id, attachments);
    return { error: null };
  } catch {
    return { error: "Failed to send message" };
  }
}

// ── Mark partner messages as read ────────────────────────────────────────────
export async function markMessagesRead(projectId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase
      .from("engineering_project_messages")
      .update({ is_read: true })
      .eq("project_id", projectId)
      .eq("sender_role", "partner")
      .eq("is_read", false);
  } catch {}
}

// ── Admin: fetch ALL projects with unread counts ──────────────────────────────
export async function adminGetAllProjects(): Promise<{
  data: any[];
  error: string | null;
}> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("engineering_projects")
      .select("*, engineering_project_messages(id, is_read, sender_role)")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };

    const projects = (data ?? []).map((p: any) => ({
      ...p,
      unread_count: (p.engineering_project_messages ?? []).filter(
        (m: any) => m.sender_role === "customer" && !m.is_read
      ).length,
      message_count: (p.engineering_project_messages ?? []).length,
    }));

    return { data: projects, error: null };
  } catch {
    return { data: [], error: "Failed to fetch projects" };
  }
}

// ── Admin: fetch messages for a project ──────────────────────────────────────
export async function adminGetProjectMessages(projectId: string): Promise<{
  data: ProjectMessage[];
  error: string | null;
}> {
  try {
    const supabase = createAdminClient();
    const { data: messages, error } = await supabase
      .from("engineering_project_messages")
      .select("*, engineering_message_files(*)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };

    const result: ProjectMessage[] = await Promise.all(
      (messages ?? []).map(async (msg: any) => {
        const files: MessageFile[] = await Promise.all(
          (msg.engineering_message_files ?? []).map(async (f: any) => {
            const { data: signed } = await supabase.storage
              .from("engineering-drawings")
              .createSignedUrl(f.storage_path, 3600);
            return { id: f.id, file_name: f.file_name, storage_path: f.storage_path, signed_url: signed?.signedUrl };
          })
        );
        return { ...msg, files };
      })
    );

    return { data: result, error: null };
  } catch {
    return { data: [], error: "Failed to fetch messages" };
  }
}

// ── Admin: send a partner reply ───────────────────────────────────────────────
export async function adminSendPartnerMessage(
  projectId: string,
  message: string | null,
  attachments: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    const { data: msg, error: msgError } = await supabase
      .from("engineering_project_messages")
      .insert({ project_id: projectId, sender_id: null, sender_role: "partner", message, is_read: false })
      .select("id")
      .single();

    if (msgError || !msg) return { error: msgError?.message ?? "Failed to send" };

    // Update project status to in_review if still pending
    await supabase
      .from("engineering_projects")
      .update({ status: "in_review" })
      .eq("id", projectId)
      .eq("status", "pending");

    await uploadMessageFiles(supabase, msg.id, "partner", attachments);
    return { error: null };
  } catch {
    return { error: "Failed to send message" };
  }
}

// ── Admin: mark customer messages as read ────────────────────────────────────
export async function adminMarkMessagesRead(projectId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("engineering_project_messages")
      .update({ is_read: true })
      .eq("project_id", projectId)
      .eq("sender_role", "customer")
      .eq("is_read", false);
  } catch {}
}

// ── Shared file upload helper ─────────────────────────────────────────────────
async function uploadMessageFiles(
  supabase: any,
  messageId: string,
  userId: string,
  attachments: { name: string; base64: string; type: string }[]
) {
  for (const att of attachments) {
    const storagePath = `${userId}/messages/${messageId}/${att.name}`;
    const binary = atob(att.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const { error: uploadError } = await supabase.storage
      .from("engineering-drawings")
      .upload(storagePath, bytes, { contentType: att.type, upsert: false });

    if (!uploadError) {
      await supabase.from("engineering_message_files").insert({
        message_id: messageId,
        file_name: att.name,
        storage_path: storagePath,
      });
    }
  }
}

// ── Partner: fetch messages for a project (admin client, bypasses RLS) ────────
export async function getPartnerProjectMessages(projectId: string): Promise<{
  data: ProjectMessage[];
  error: string | null;
}> {
  return adminGetProjectMessages(projectId);
}

// ── Partner: send a message ───────────────────────────────────────────────────
export async function sendPartnerMessage(
  projectId: string,
  message: string | null,
  attachments: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    const { data: msg, error: msgError } = await supabase
      .from("engineering_project_messages")
      .insert({
        project_id: projectId,
        sender_id: null,
        sender_role: "partner",
        message,
        is_read: false,
      })
      .select("id")
      .single();

    if (msgError || !msg) return { error: msgError?.message ?? "Failed to send" };

    // Transition project status from pending → in_review
    await supabase
      .from("engineering_projects")
      .update({ status: "in_review" })
      .eq("id", projectId)
      .eq("status", "pending");

    await uploadMessageFiles(supabase, msg.id, "partner", attachments);
    return { error: null };
  } catch {
    return { error: "Failed to send message" };
  }
}

// ── Partner: mark customer messages as read ───────────────────────────────────
export async function markPartnerMessagesRead(projectId: string): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("engineering_project_messages")
      .update({ is_read: true })
      .eq("project_id", projectId)
      .eq("sender_role", "customer")
      .eq("is_read", false);
  } catch {}
}
