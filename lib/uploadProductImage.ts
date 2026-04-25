import { createBrowserClient } from "@/lib/supabase/client";

/**
 * Uploads a product image directly from the browser to Supabase Storage.
 * File bytes never pass through Next.js — zero re-encoding, zero quality loss.
 */
export async function uploadProductImage(file: File, userId: string, slot: number): Promise<string> {
  const supabase = createBrowserClient();

  // Preserve original extension so the browser serves the correct MIME type
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "jpg";
  const path = `${userId}/${Date.now()}_${slot}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      // No cacheControl override — let Supabase use its default
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
