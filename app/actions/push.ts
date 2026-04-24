'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';

export async function savePushSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const { error } = await admin.from('push_subscriptions').upsert(
      {
        user_id: user?.id ?? null,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      { onConflict: 'endpoint' }
    );
    return { error: error?.message ?? null };
  } catch {
    return { error: 'Failed to save subscription' };
  }
}
