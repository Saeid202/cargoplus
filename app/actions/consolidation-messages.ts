"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface BuyerMessage {
  id: string;
  sender_role: "buyer" | "agent";
  message: string | null;
  is_read: boolean;
  created_at: string;
  files: { id: string; file_name: string; url: string }[];
}

export async function getBuyerOrderMessages(orderId: string): Promise<{ data: BuyerMessage[]; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("consolidation_order_messages")
      .select("*, consolidation_message_files(*)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };

    return {
      data: (data ?? []).map((m: any) => ({
        ...m,
        files: (m.consolidation_message_files ?? []).map((f: any) => ({
          id: f.id, file_name: f.file_name, url: f.url,
        })),
      })),
      error: null,
    };
  } catch { return { data: [], error: "Failed to fetch messages" }; }
}

export async function sendBuyerMessage(
  orderId: string,
  message: string | null,
  files: { name: string; base64: string; type: string }[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: msg, error: msgError } = await supabase
      .from("consolidation_order_messages")
      .insert({ order_id: orderId, sender_id: user.id, sender_role: "buyer", message, is_read: false })
      .select("id").single();

    if (msgError || !msg) return { error: msgError?.message ?? "Failed to send" };

    for (const file of files) {
      const storagePath = `${user.id}/messages/${msg.id}/${file.name}`;
      const binary = atob(file.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const { error: uploadError } = await supabase.storage
        .from("consolidation-responses")
        .upload(storagePath, bytes, { contentType: file.type, upsert: false });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("consolidation-responses").getPublicUrl(storagePath);
        await supabase.from("consolidation_message_files").insert({
          message_id: msg.id, file_name: file.name, storage_path: storagePath, url: publicUrl,
        });
      }
    }

    return { error: null };
  } catch { return { error: "Failed to send message" }; }
}

export async function markAgentMessagesRead(orderId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("consolidation_order_messages")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .eq("sender_role", "agent");

    // Clear unread flag
    await supabase
      .from("consolidation_orders")
      .update({ has_unread_response: false })
      .eq("id", orderId)
      .eq("user_id", user.id);
  } catch {}
}
