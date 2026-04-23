import { HeroSlider } from "@/components/home/HeroSlider";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { getHeroSlides } from "@/app/actions/hero-slides";
import { getProducts } from "@/app/actions/products";
import { mockHeroSlides, mockProducts } from "@/lib/mock-data";
import type { HeroSlideData, ProductWithRelations } from "@/types";

// Always fetch fresh data
export const revalidate = 0;

export default async function HomePage() {
  // Try to fetch from Supabase with timeout protection, fall back to mock data
  let heroResult: { data: any[] | null; error: string | null } = { data: null, error: "Using mock data" };
  let productsResult: { data: any[] | null; error: string | null } = { data: null, error: "Using mock data" };
  
  try {
    // Add timeout protection to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 3000)
    );
    
    const [heroData, productsData] = await Promise.allSettled([
      Promise.race([getHeroSlides(), timeoutPromise]),
      Promise.race([getProducts({ limit: 8 }), timeoutPromise]),
    ]);
    
    if (heroData.status === 'fulfilled') {
      heroResult = heroData.value as { data: any[] | null; error: string | null };
    }
    
    if (productsData.status === 'fulfilled') {
      productsResult = productsData.value as { data: any[] | null; error: string | null };
    }
  } catch (error) {
    console.log("Home page: Using mock data due to database issues");
  }

  // Transform database results to application types or use mock data
  const dbHeroSlides: HeroSlideData[] = heroResult.data?.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    imageUrl: slide.image_url,
    ctaText: slide.cta_text,
    ctaLink: slide.cta_link,
    position: slide.position,
    isActive: slide.is_active,
  })) ?? [];
  const heroSlides: HeroSlideData[] = dbHeroSlides.length > 0 ? dbHeroSlides : mockHeroSlides;

  const dbProducts: ProductWithRelations[] = productsResult.data?.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compare_at_price,
    stockQuantity: product.stock_quantity,
    categoryId: product.category_id,
    sellerId: product.seller_id,
    status: product.status,
    specifications: product.specifications as Record<string, string>,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    images: product.product_images.map((img) => ({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      altText: img.alt_text,
      position: img.position,
    })),
    category: product.categories ? {
      id: product.categories.id,
      name: product.categories.name,
      slug: product.categories.slug,
      description: product.categories.description,
      imageUrl: product.categories.image_url,
    } : { id: "", name: "Uncategorized", slug: "uncategorized", description: null, imageUrl: null },
    seller: product.sellers ? {
      id: product.sellers.id,
      businessName: product.sellers.business_name,
      businessEmail: product.sellers.business_email,
      logoUrl: product.sellers.logo_url,
      status: product.sellers.status,
    } : { id: "", businessName: "Unknown Seller", businessEmail: "", logoUrl: null, status: "active" as const },
  })) ?? [];
  const products: ProductWithRelations[] = dbProducts.length > 0 ? dbProducts : mockProducts;

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <ServicesSection />
      <ProductShowcase products={products} title="Featured Products" />
    </>
  );
}
