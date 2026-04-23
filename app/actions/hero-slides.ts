"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/types/database";

export async function getHeroSlides(): Promise<{
  data: HeroSlide[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();

    const result = await Promise.race([
      supabase.from("hero_slides").select("*").eq("is_active", true).order("position", { ascending: true }),
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 3000)
      ),
    ]);

    if (result.error) {
      console.error("Error fetching hero slides:", result.error);
      return { data: null, error: result.error.message };
    }

    return { data: result.data, error: null };
  } catch (err) {
    console.error("Unexpected error fetching hero slides:", err);
    return { data: null, error: "Failed to fetch hero slides" };
  }
}
