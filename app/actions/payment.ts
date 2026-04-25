"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function createPaymentIntent(
  amountCents: number
): Promise<{ clientSecret: string | null; error: string | null }> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { clientSecret: null, error: "You must be logged in to checkout." };
    }

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: paymentIntent.client_secret, error: null };
  } catch (err) {
    console.error("Error creating payment intent:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create payment intent.";
    return { clientSecret: null, error: message };
  }
}
