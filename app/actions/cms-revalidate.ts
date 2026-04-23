"use server";

import { revalidatePath } from "next/cache";

/** Revalidate only the homepage */
export async function revalidateHome() {
  revalidatePath("/");
}

/** Revalidate all public routes (used when nav changes) */
export async function revalidateAllPublic() {
  revalidatePath("/", "layout");
}

/** Revalidate a specific page slug */
export async function revalidatePage(slug: string) {
  revalidatePath(`/${slug}`);
}
