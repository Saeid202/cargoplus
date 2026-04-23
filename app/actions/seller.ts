"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Product, ProductImage, Category, Seller } from "@/types/database";

export interface SellerProduct extends Product {
  product_images: ProductImage[];
  categories: Category | null;
}

// Combined function for dashboard - single auth call, parallel queries
export async function getSellerDashboardData(): Promise<{
  profile: Seller | null;
  products: SellerProduct[];
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { profile: null, products: [], error: "Not authenticated" };
    }

    // Parallel queries - only one auth call above
    const [profileResult, productsResult] = await Promise.all([
      supabase.from("sellers").select("*").eq("id", user.id).single(),
      supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          categories (*)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      return { profile: null, products: [], error: profileResult.error.message };
    }

    return {
      profile: profileResult.data,
      products: (productsResult.data as SellerProduct[]) || [],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching seller dashboard data:", err);
    return { profile: null, products: [], error: "Failed to fetch data" };
  }
}

// Get current seller profile
export async function getSellerProfile(): Promise<{
  data: Seller | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error fetching seller profile:", err);
    return { data: null, error: "Failed to fetch seller profile" };
  }
}

// Get seller's products - optimized to accept optional userId
export async function getSellerProducts(userId?: string): Promise<{
  data: SellerProduct[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    // Use provided userId or fetch user
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: "Not authenticated" };
      }
      uid = user.id;
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (*),
        categories (*)
      `)
      .eq("seller_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as SellerProduct[], error: null };
  } catch (err) {
    console.error("Error fetching seller products:", err);
    return { data: null, error: "Failed to fetch products" };
  }
}

// Create a new product
export async function createProduct(formData: FormData): Promise<{
  data: Product | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    // Get seller profile
    const { data: seller } = await supabase
      .from("sellers")
      .select("id, status")
      .eq("id", user.id)
      .single();

    if (!seller || seller.status !== "active") {
      return { data: null, error: "Seller account not active" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const specificationsStr = formData.get("specifications") as string;
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Parse specifications JSON
    let specifications = {};
    try {
      if (specificationsStr) {
        specifications = JSON.parse(specificationsStr);
      }
    } catch {
      // If not valid JSON, try key=value format
      const lines = specificationsStr.split("\n").filter(Boolean);
      for (const line of lines) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          specifications[key] = value;
        }
      }
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description,
        price,
        compare_at_price: compareAtPrice,
        stock_quantity: stockQuantity,
        category_id: categoryId,
        seller_id: user.id,
        specifications,
        status: "active", // Auto-approved
      })
      .select()
      .single();

    if (productError) {
      return { data: null, error: productError.message };
    }

    // Handle image uploads
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${product.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        await supabase.from("product_images").insert({
          product_id: product.id,
          url: publicUrl,
          alt_text: name,
          position: 0,
        });
      }
    }

    revalidatePath("/seller/products");
    return { data: product, error: null };
  } catch (err) {
    console.error("Error creating product:", err);
    return { data: null, error: "Failed to create product" };
  }
}

// Update an existing product
export async function updateProduct(productId: string, formData: FormData): Promise<{
  data: Product | null;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: existingProduct } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (!existingProduct || existingProduct.seller_id !== user.id) {
      return { data: null, error: "Product not found or access denied" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const specificationsStr = formData.get("specifications") as string;
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Parse specifications
    let specifications = {};
    try {
      if (specificationsStr) {
        specifications = JSON.parse(specificationsStr);
      }
    } catch {
      const lines = specificationsStr.split("\n").filter(Boolean);
      for (const line of lines) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (key && value) {
          specifications[key] = value;
        }
      }
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
        name,
        slug,
        description,
        price,
        compare_at_price: compareAtPrice,
        stock_quantity: stockQuantity,
        category_id: categoryId,
        specifications,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (productError) {
      return { data: null, error: productError.message };
    }

    // Handle new image upload
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${productId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        // Add new image
        await supabase.from("product_images").insert({
          product_id: productId,
          url: publicUrl,
          alt_text: name,
          position: 0,
        });
      }
    }

    revalidatePath("/seller/products");
    return { data: product, error: null };
  } catch (err) {
    console.error("Error updating product:", err);
    return { data: null, error: "Failed to update product" };
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: product } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", productId)
      .single();

    if (!product || product.seller_id !== user.id) {
      return { success: false, error: "Product not found or access denied" };
    }

    // Delete product images from storage
    const { data: images } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", productId);

    if (images) {
      for (const img of images) {
        const path = img.url.split("/product-images/")[1];
        if (path) {
          await supabase.storage.from("product-images").remove([path]);
        }
      }
    }

    // Delete product (cascade will delete images)
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/seller/products");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting product:", err);
    return { success: false, error: "Failed to delete product" };
  }
}

// Register as a seller
export async function registerSeller(formData: FormData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createServerClient();
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;
    const businessPhone = formData.get("businessPhone") as string;
    const businessAddress = formData.get("businessAddress") as string;
    const description = formData.get("description") as string;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "seller",
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create account" };
    }

    // Create profile
    await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      role: "seller",
    });

    // Create seller profile
    const { error: sellerError } = await supabase.from("sellers").insert({
      id: authData.user.id,
      business_name: businessName,
      business_email: email,
      business_phone: businessPhone || null,
      business_address: businessAddress || null,
      description: description || null,
      status: "active", // Auto-approved, no admin review needed
    });
    
    return { success: true, error: null };
  } catch (err) {
    console.error("Error registering seller:", err);
    return { success: false, error: "Failed to register seller" };
  }
}

// Get categories for product form
export async function getCategories() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, parent_id, created_at")
      .order("name");
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
