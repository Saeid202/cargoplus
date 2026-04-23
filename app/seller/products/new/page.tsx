import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerProfile, getCategories } from "@/app/actions/seller";
import { NewProductForm } from "./NewProductForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Add New Product",
  description: "Add a new product to your CargoPlus seller account.",
};

export default async function NewProductPage() {
  const profileResult = await getSellerProfile();
  
  if (!profileResult.data && profileResult.error === "Not authenticated") {
    redirect("/seller/login");
  }

  const categoriesResult = await getCategories();
  const categories = categoriesResult || [];

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
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the details below to list a new product. Products are reviewed before going live.
        </p>

        <div className="bg-card border rounded-xl p-6">
          <NewProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
