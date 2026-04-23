"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface SubmitEngineeringProjectInput {
  project_name: string;
  project_location_city: string;
  project_location_province: string;
  project_type: "residential" | "commercial" | "industrial";
  total_area: number;
  number_of_floors: number;
  building_length: number;
  building_width: number;
  building_height?: number | null;
  structure_type: string;
  no_drawings_flag: boolean;
  delivery_location: string;
  budget_range: "under_100k" | "100k_300k" | "300k_plus";
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  project_description?: string | null;
  drawings: { name: string; base64: string; type: string }[];
}

export async function submitEngineeringProject(
  input: SubmitEngineeringProjectInput
): Promise<{ projectId: string | null; error: string | null }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { projectId: null, error: "Not authenticated" };
    }

    // 1. Insert project row
    const { data: project, error: projectError } = await supabase
      .from("engineering_projects")
      .insert({
        user_id: user.id,
        project_name: input.project_name,
        project_location_city: input.project_location_city,
        project_location_province: input.project_location_province,
        project_type: input.project_type,
        total_area: input.total_area,
        number_of_floors: input.number_of_floors,
        building_length: input.building_length,
        building_width: input.building_width,
        building_height: input.building_height ?? null,
        structure_type: input.structure_type,
        no_drawings_flag: input.no_drawings_flag,
        delivery_location: input.delivery_location,
        budget_range: input.budget_range,
        full_name: input.full_name,
        company_name: input.company_name,
        email: input.email,
        phone: input.phone,
        project_description: input.project_description ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (projectError || !project) {
      return { projectId: null, error: projectError?.message ?? "Failed to create project" };
    }

    // 2. Upload drawings if any
    if (!input.no_drawings_flag && input.drawings.length > 0) {
      for (const drawing of input.drawings) {
        const storagePath = `${user.id}/${project.id}/${drawing.name}`;

        // Convert base64 to Uint8Array
        const binary = atob(drawing.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
          .from("engineering-drawings")
          .upload(storagePath, bytes, { contentType: drawing.type, upsert: false });

        if (uploadError) {
          console.error("Drawing upload error:", uploadError.message);
          continue; // don't fail the whole submission for one file
        }

        await supabase.from("engineering_project_drawings").insert({
          project_id: project.id,
          file_name: drawing.name,
          storage_path: storagePath,
        });
      }
    }

    return { projectId: project.id, error: null };
  } catch (err) {
    console.error("Engineering project submission error:", err);
    return { projectId: null, error: "Submission failed. Please try again." };
  }
}

export interface EngineeringProjectRow {
  id: string;
  project_name: string;
  project_location_city: string;
  project_location_province: string;
  project_type: string;
  total_area: number;
  number_of_floors: number;
  building_length: number;
  building_width: number;
  building_height: number | null;
  structure_type: string;
  no_drawings_flag: boolean;
  delivery_location: string;
  budget_range: string;
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  project_description: string | null;
  status: string;
  created_at: string;
}

export async function getMyEngineeringProjects(): Promise<{
  data: EngineeringProjectRow[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("engineering_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: data as EngineeringProjectRow[], error: null };
  } catch {
    return { data: [], error: "Failed to fetch projects" };
  }
}

export async function updateEngineeringProject(
  id: string,
  input: Partial<SubmitEngineeringProjectInput>
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("engineering_projects")
      .update({
        project_name: input.project_name,
        project_location_city: input.project_location_city,
        project_location_province: input.project_location_province,
        project_type: input.project_type,
        total_area: input.total_area,
        number_of_floors: input.number_of_floors,
        building_length: input.building_length,
        building_width: input.building_width,
        building_height: input.building_height ?? null,
        structure_type: input.structure_type,
        no_drawings_flag: input.no_drawings_flag,
        delivery_location: input.delivery_location,
        budget_range: input.budget_range,
        full_name: input.full_name,
        company_name: input.company_name,
        email: input.email,
        phone: input.phone,
        project_description: input.project_description ?? null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "Failed to update project" };
  }
}

export async function deleteEngineeringProject(
  id: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Delete drawings from storage first
    const { data: drawings } = await supabase
      .from("engineering_project_drawings")
      .select("storage_path")
      .eq("project_id", id);

    if (drawings && drawings.length > 0) {
      await supabase.storage
        .from("engineering-drawings")
        .remove(drawings.map((d) => d.storage_path));
    }

    const { error } = await supabase
      .from("engineering_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "Failed to delete project" };
  }
}
