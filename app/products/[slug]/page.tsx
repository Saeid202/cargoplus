import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { getProductBySlug, getProducts } from "@/app/actions/products";
import { mockProducts } from "@/lib/mock-data";
import type { ProductWithRelations } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// Transform database product to application type
function transformProduct(dbProduct: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>["data"]>): ProductWithRelations {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try database first
  const result = await getProductBySlug(slug);
  if (result.data) {
    return {
      title: result.data.name,
      description: result.data.description ?? `${result.data.name} - $${result.data.price} CAD`,
    };
  }
  
  // Fall back to mock data
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) {
    return { title: "Product Not Found" };
  }
  return {
    title: product.name,
    description: product.description ?? `${product.name} - $${product.price} CAD`,
  };
}

export async function generateStaticParams() {
  // Skip static generation — use dynamic rendering at request time
  return [];
}

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  
  // Try database first
  const result = await getProductBySlug(slug);
  let product: ProductWithRelations | null = null;
  
  if (result.data) {
    product = transformProduct(result.data);
  } else {
    // Fall back to mock data
    product = mockProducts.find((p) => p.slug === slug) ?? null;
  }

  if (!product) {
    notFound();
  }

  const image = product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const inStock = product.stockQuantity > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-4 left-4 rounded-md bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              Sale
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)} CAD
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-6">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                <Check className="h-4 w-4" />
                In Stock ({product.stockQuantity} available)
              </span>
            ) : (
              <span className="text-sm text-destructive">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Specifications</h2>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="col-span-2 sm:col-span-1">
                    <dt className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Seller info */}
          <div className="mb-6 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Sold by</p>
            <p className="font-medium">{product.seller.businessName}</p>
          </div>

          {/* Add to cart */}
          <button
            disabled={!inStock}
            className="mt-auto flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
