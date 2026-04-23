import { Metadata } from "next";
import { ProductCatalog } from "./ProductCatalog";
import { getProducts, getCategories } from "@/app/actions/products";
import { mockProducts } from "@/lib/mock-data";
import type { ProductWithRelations, CategoryData } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Products",
  description: "Browse our catalog of construction materials and industrial robots. Quality products from trusted Chinese suppliers, shipped to Canada.",
};

// Transform database product to application type
function transformProduct(dbProduct: NonNullable<Awaited<ReturnType<typeof getProducts>>["data"]>[number]): ProductWithRelations {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    price: dbProduct.price,
    compareAtPrice: dbProduct.compare_at_price,
    stockQuantity: dbProduct.stock_quantity,
    categoryId: dbProduct.category_id,
    sellerId: dbProduct.seller_id,
    status: dbProduct.status,
    specifications: dbProduct.specifications as Record<string, string>,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    images: dbProduct.product_images.map((img) => ({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
    })),
    category: dbProduct.categories ? {
      id: dbProduct.categories.id,
      name: dbProduct.categories.name,
      slug: dbProduct.categories.slug,
      description: dbProduct.categories.description,
      imageUrl: dbProduct.categories.image_url,
    } : { id: "", name: "Uncategorized", slug: "uncategorized", description: null, imageUrl: null },
    seller: dbProduct.sellers ? {
      id: dbProduct.sellers.id,
      businessName: dbProduct.sellers.business_name,
      businessEmail: dbProduct.sellers.business_email,
      logoUrl: dbProduct.sellers.logo_url,
      status: dbProduct.sellers.status,
    } : { id: "", businessName: "Unknown Seller", businessEmail: "", logoUrl: null, status: "active" as const },
  };
}

export default async function ProductsPage() {
  // Try to fetch from Supabase
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ limit: 100 }),
    getCategories(),
  ]);

  // Transform database results or use mock data as fallback
  const dbProducts = productsResult.data?.map(transformProduct) ?? [];
  const products: ProductWithRelations[] = dbProducts.length > 0 ? dbProducts : mockProducts;

  const dbCategories = categoriesResult.data?.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.image_url,
  })) ?? [];
  const categories: CategoryData[] = dbCategories.length > 0
    ? dbCategories
    : Array.from(new Map(mockProducts.map(p => [p.category.slug, p.category])).values());

  return <ProductCatalog initialProducts={products} categories={categories} />;
}
