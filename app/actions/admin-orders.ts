"use server";

import { createServerClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

export interface AdminOrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  payment_status: string;
  payment_id: string | null;
  shipping_address: Record<string, string>;
  created_at: string;
  order_items?: {
    id: string;
    product_name: string;
    variant_code: string | null;
    variant_image_url: string | null;
    quantity: number;
    product_price: number;
    line_total: number;
  }[];
  // joined from profiles
  customer_email?: string;
}

async function assertAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { supabase: null, error: "Access denied" };
  return { supabase, error: null };
}

export async function getAllOrders(): Promise<{
  data: AdminOrderRow[] | null;
  error: string | null;
}> {
  try {
    const { supabase, error: authError } = await assertAdmin();
    if (authError || !supabase) return { data: null, error: authError };

    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (*)`)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as AdminOrderRow[], error: null };
  } catch (err) {
    console.error("getAllOrders error:", err);
    return { data: null, error: "Failed to fetch orders" };
  }
}

export async function getOrderDetail(orderId: string): Promise<{
  data: AdminOrderRow | null;
  error: string | null;
}> {
  try {
    const { supabase, error: authError } = await assertAdmin();
    if (authError || !supabase) return { data: null, error: authError };

    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (*)`)
      .eq("id", orderId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as AdminOrderRow, error: null };
  } catch (err) {
    console.error("getOrderDetail error:", err);
    return { data: null, error: "Failed to fetch order" };
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{
  error: string | null;
}> {
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` };
  }

  try {
    const { supabase, error: authError } = await assertAdmin();
    if (authError || !supabase) return { error: authError };

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return { error: "Failed to update order status" };
  }
}
