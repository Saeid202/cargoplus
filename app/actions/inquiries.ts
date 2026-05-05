"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ProjectEstimateInput {
  name: string;
  email: string;
  projectType: string;
  projectSize: string;
  location: string;
  budget: string;
  notes?: string;
}

export async function submitProjectEstimate(
  input: ProjectEstimateInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Validate required fields
    if (!input.name.trim() || !input.email.trim() || !input.projectType || !input.projectSize || !input.location.trim() || !input.budget) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Serialize estimate details into the message field
    const message = [
      `Project Type: ${input.projectType}`,
      `Project Size: ${input.projectSize}`,
      `Location: ${input.location}`,
      `Budget Range: ${input.budget}`,
      input.notes?.trim() ? `Additional Notes: ${input.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const admin = createAdminClient();

    const { error } = await admin.from("inquiries").insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: "Project Cost Estimate Request",
      message,
      status: "new",
    });

    if (error) {
      console.error("submitProjectEstimate insert error:", error.message);
      return { success: false, error: "Failed to submit. Please try again or contact us directly." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("submitProjectEstimate unexpected error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
