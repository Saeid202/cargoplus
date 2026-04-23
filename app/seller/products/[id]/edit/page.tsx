import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSellerProfile, getSellerProducts } from "@/app/actions/seller";
import { getCategories } from "@/app/actions/products";
import { EditProductForm } from "./EditProductForm";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit your product listing on CargoPlus.",
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  
  const [profileResult, productsResult, categoriesResult] = await Promise.all([
    getSellerProfile(),
    getSellerProducts(),
    getCategories(),
  ]);

  if (!profileResult.data && profileResult.error === "Not authenticated") {
    redirect("/seller/login");
  }

  const products = productsResult.data || [];
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const categories = categoriesResult.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground mb-8">
          Update your product details. Changes may require review.
        </p>

        <div className="bg-card border rounded-xl p-6">
          <EditProductForm product={product} categories={categories} />
        </div>
      </div>
    </div>
  );
}
