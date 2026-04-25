"use server";

import { createServerClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ParticipantRole = "customer" | "agent" | "partner";

export interface Conversation {
  id: string;
  participant_a_id: string;
  participant_a_role: ParticipantRole;
  participant_b_id: string;
  participant_b_role: ParticipantRole;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  // Joined
  other_user_id: string;
  other_user_role: ParticipantRole;
  other_user_name: string;
  unread_count: number;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: ParticipantRole;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  role: ParticipantRole;
  full_name: string;
  email: string;
}

// ── Get all conversations for the current user ────────────────────────────────

export async function getMyConversations(): Promise<{ data: Conversation[]; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) return { data: [], error: error.message };
    if (!data?.length) return { data: [], error: null };

    // Batch fetch all other participant IDs in one query
    const otherIds = data.map((conv: any) =>
      conv.participant_a_id === user.id ? conv.participant_b_id : conv.participant_a_id
    );
    const uniqueIds = [...new Set(otherIds)];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", uniqueIds);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p as { id: string; full_name?: string | null; email?: string | null }]));

    // Batch fetch unread counts in one query
    const { data: unreadRows } = await supabase
      .from("direct_messages")
      .select("conversation_id")
      .in("conversation_id", data.map((c: any) => c.id))
      .eq("is_read", false)
      .neq("sender_id", user.id);

    const unreadMap = new Map<string, number>();
    for (const row of unreadRows ?? []) {
      unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) ?? 0) + 1);
    }

    const result: Conversation[] = data.map((conv: any) => {
      const otherId = conv.participant_a_id === user.id ? conv.participant_b_id : conv.participant_a_id;
      const otherRole: ParticipantRole = conv.participant_a_id === user.id ? conv.participant_b_role : conv.participant_a_role;
      const profile = profileMap.get(otherId);
      return {
        ...conv,
        other_user_id: otherId,
        other_user_role: otherRole,
        other_user_name: profile?.full_name ?? profile?.email ?? "Unknown",
        unread_count: unreadMap.get(conv.id) ?? 0,
      };
    });

    return { data: result, error: null };
  } catch {
    return { data: [], error: "Failed to fetch conversations" };
  }
}

// ── Get or create a conversation between current user and another user ─────────

export async function getOrCreateConversation(
  otherUserId: string,
  otherRole: ParticipantRole
): Promise<{ data: Conversation | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const myRole = profile?.role as ParticipantRole;

    // Check if conversation already exists (either direction)
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant_a_id.eq.${user.id},participant_b_id.eq.${otherUserId}),` +
        `and(participant_a_id.eq.${otherUserId},participant_b_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", otherUserId)
        .single();

      return {
        data: {
          ...existing,
          other_user_id: otherUserId,
          other_user_role: otherRole,
          other_user_name: otherProfile?.full_name ?? otherProfile?.email ?? "Unknown",
          unread_count: 0,
        },
        error: null,
      };
    }

    // Create new conversation
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        participant_a_id: user.id,
        participant_a_role: myRole,
        participant_b_id: otherUserId,
        participant_b_role: otherRole,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    const { data: otherProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", otherUserId)
      .single();

    return {
      data: {
        ...created,
        other_user_id: otherUserId,
        other_user_role: otherRole,
        other_user_name: otherProfile?.full_name ?? otherProfile?.email ?? "Unknown",
        unread_count: 0,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Failed to get or create conversation" };
  }
}

// ── Get messages in a conversation ────────────────────────────────────────────

export async function getConversationMessages(
  conversationId: string
): Promise<{ data: DirectMessage[]; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };
    return { data: data ?? [], error: null };
  } catch {
    return { data: [], error: "Failed to fetch messages" };
  }
}

// ── Send a message ────────────────────────────────────────────────────────────

export async function sendDirectMessage(
  conversationId: string,
  message: string
): Promise<{ data: DirectMessage | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const { data: msg, error } = await supabase
      .from("direct_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_role: profile?.role as ParticipantRole,
        message: message.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    // Update conversation's last_message
    await supabase
      .from("conversations")
      .update({ last_message: message.trim(), last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { data: msg, error: null };
  } catch {
    return { data: null, error: "Failed to send message" };
  }
}

// ── Mark all messages in a conversation as read ───────────────────────────────

export async function markConversationRead(conversationId: string): Promise<void> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  } catch { /* silent */ }
}

// ── Get available contacts (agents + partners the user can message) ───────────

export async function getAvailableContacts(): Promise<{ data: Contact[]; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .in("role", ["agent", "partner"])
      .neq("id", user.id)
      .order("role")
      .order("full_name");

    if (error) return { data: [], error: error.message };

    return {
      data: (data ?? []).map((p: any) => ({
        id: p.id,
        role: p.role as ParticipantRole,
        full_name: p.full_name ?? p.email,
        email: p.email,
      })),
      error: null,
    };
  } catch {
    return { data: [], error: "Failed to fetch contacts" };
  }
}

// ── Get total unread count across all conversations ───────────────────────────

export async function getTotalUnreadCount(): Promise<number> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get all conversation IDs for this user
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_a_id.eq.${user.id},participant_b_id.eq.${user.id}`);

    if (!convs?.length) return 0;

    const convIds = convs.map((c: any) => c.id);

    const { count } = await supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    return count ?? 0;
  } catch {
    return 0;
  }
}
