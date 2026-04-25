"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Partner } from "@/types/database";

export interface CreatePartnerInput {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  phone?: string | null;
}

export async function createPartner(
  input: CreatePartnerInput
): Promise<{ data: Partner | null; error: string | null }> {
  try {
    const admin = createAdminClient();

    // Create auth user with partner role in user_metadata
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { role: "partner" },
    });

    if (authError) {
      return { data: null, error: authError.message };
    }

    if (!authData.user) {
      return { data: null, error: "Failed to create auth user" };
    }

    // Insert partner profile row — status defaults to 'active' via DB default
    const { data: partner, error: partnerError } = await admin
      .from("partners")
      .insert({
        id: authData.user.id,
        company_name: input.company_name,
        contact_name: input.contact_name,
        email: input.email,
        phone: input.phone ?? null,
      })
      .select()
      .single();

    if (partnerError) {
      // Clean up the auth user if profile insert fails
      await admin.auth.admin.deleteUser(authData.user.id);
      return { data: null, error: partnerError.message };
    }

    // Ensure the profiles row has role = 'partner'
    await admin
      .from("profiles")
      .update({ role: "partner" })
      .eq("id", authData.user.id);

    return { data: partner as Partner, error: null };
  } catch (err) {
    console.error("createPartner error:", err);
    return { data: null, error: "Failed to create partner" };
  }
}

export async function listPartners(): Promise<{
  data: Partner[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("partners")
      .select("id, company_name, contact_name, email, phone, country, status, created_at")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as Partner[], error: null };
  } catch (err) {
    console.error("listPartners error:", err);
    return { data: [], error: "Failed to list partners" };
  }
}

export async function updatePartnerStatus(
  id: string,
  status: "active" | "suspended"
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("partners")
      .update({ status })
      .eq("id", id);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    console.error("updatePartnerStatus error:", err);
    return { error: "Failed to update partner status" };
  }
}
