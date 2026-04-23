"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/types/cms";

export async function uploadCmsImage(formData: FormData): Promise<ActionResult<string>> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { data: null, error: "No file provided" };

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { data: null, error: "Image must be under 5MB" };
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `slider/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("cms-images")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) return { data: null, error: error.message };

    const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(fileName);
    return { data: urlData.publicUrl, error: null };
  } catch (err: any) {
    return { data: null, error: err.message ?? "Upload failed" };
  }
}
