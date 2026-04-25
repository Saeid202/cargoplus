"use server";

import { createServerClient } from "@/lib/supabase/server";
import { clearCartItems } from "@/app/actions/cart";
import type { CartItem } from "@/lib/stores/cartStore";
import type { ShippingFormData } from "@/app/checkout/steps/ShippingStep";
import type { TaxBreakdown } from "@/lib/tax/calculator";

export interface CreateOrderInput {
  cartItems: CartItem[];
  shippingAddress: ShippingFormData;
  taxBreakdown: TaxBreakdown;
  paymentId: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  variant_code: string | null;
  variant_image_url: string | null;
  quantity: number;
  line_total: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  shipping_address: Record<string, unknown>;
  payment_status: string;
  payment_id: string | null;
  created_at: string;
  order_items?: OrderItemRow[];
}

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `CP-${date}-${suffix}`;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  orderNumber: string | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { orderNumber: null, error: "Not authenticated" };

    const { cartItems, shippingAddress, taxBreakdown, paymentId } = input;

    const subtotal = taxBreakdown.subtotal;
    const taxAmount = taxBreakdown.taxAmount;
    const total = taxBreakdown.total;

    // Generate unique order number (retry once on collision)
    let orderNumber = generateOrderNumber();
    let attempt = 0;

    while (attempt < 2) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempt++;
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: "pending",
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: 0,
        total,
        shipping_address: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          city: shippingAddress.city,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
          country: "Canada",
        },
        payment_status: "paid",
        payment_id: paymentId,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError?.message, "payment_id:", paymentId);
      return { orderNumber: null, error: "Failed to save order. Please contact support with reference: " + paymentId };
    }

    // Insert order items
    const rows = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      variant_code: item.variantCode,
      variant_image_url: item.variantImageUrl,
      quantity: item.quantity,
      line_total: Math.round(item.productPrice * item.quantity * 100) / 100,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(rows);
    if (itemsError) {
      console.error("Order items insert failed:", itemsError.message, "order_id:", order.id, "payment_id:", paymentId);
      // Order exists but items failed — still return order number so user isn't left hanging
    }

    // Clear cart
    await clearCartItems();

    return { orderNumber: order.order_number, error: null };
  } catch (err) {
    console.error("createOrder unexpected error:", err);
    return { orderNumber: null, error: "An unexpected error occurred. Please contact support." };
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<{
  data: OrderRow | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (*)`)
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as OrderRow, error: null };
  } catch (err) {
    console.error("getOrderByNumber error:", err);
    return { data: null, error: "Failed to fetch order" };
  }
}
