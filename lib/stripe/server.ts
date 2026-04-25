import Stripe from "stripe";

function createStripeInstance(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Please add it to your environment variables."
    );
  }
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

// Singleton — created lazily so missing key only throws at call time
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = createStripeInstance();
  }
  return _stripe;
}

export default getStripe;
