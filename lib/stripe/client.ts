import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Returns a cached Promise<Stripe | null>.
 * SSR-safe: returns null when called on the server.
 */
export function getStripe(): Promise<Stripe | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }

  return stripePromise;
}
