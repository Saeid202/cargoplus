import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerProfile, getSellerProducts, deleteProduct } from "@/app/actions/seller";
import { Package, Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import { ProductActions } from "./ProductActions";

export const metadata: Metadata = {
  title: "My Products",
  description: "Manage your product listings on CargoPlus.",
};

export default async function SellerProductsPage() {
  const [profileResult, productsResult] = await Promise.all([
    getSellerProfile(),
    getSellerProducts(),
  ]);

  // Only redirect if not authenticated, not on DB errors
  if (!profileResult.data && profileResult.error === "Not authenticated") {
    redirect("/seller/login");
  }

  const products = productsResult.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No products yet</h2>
          <p className="text-muted-foreground mb-6">
            Start adding products to sell on CargoPlus.
          </p>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                          {product.product_images[0] ? (
                            <img
                              src={product.product_images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.categories?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={product.stock_quantity < 10 ? "text-red-600 font-medium" : ""}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : product.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : product.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductActions productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
