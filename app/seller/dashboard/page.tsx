import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerDashboardData } from "@/app/actions/seller";
import { Package, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your CargoPlus seller account and products.",
};

export default async function SellerDashboardPage() {
  let profile: any = null;
  let products: any[] = [];
  let error: string | null = null;

  try {
    const result = await getSellerDashboardData();
    profile = result.profile;
    products = result.products || [];
    error = result.error;
  } catch (err) {
    console.error("Seller dashboard error:", err);
    error = "Failed to load dashboard data";
  }

  // If not authenticated or not a seller, redirect to login
  if (!profile && !error) {
    redirect("/seller/login");
  }

  // If there's an error but we have profile data, show dashboard with error message
  if (error && profile) {
    console.log("Seller dashboard loaded with error:", error);
  }

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const pendingProducts = products.filter(p => p.status === "pending").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.business_name || "Seller"}
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          + Add Product
        </Link>
      </div>

      {/* Account Status Banner */}
      {profile?.status === "pending" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Account Pending Approval</h3>
            <p className="text-sm text-yellow-700">
              Your seller account is under review. You can add products, but they won&apos;t be visible until your account is approved.
            </p>
          </div>
        </div>
      )}

      {profile?.status === "suspended" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Account Suspended</h3>
            <p className="text-sm text-red-700">
              Your seller account has been suspended. Contact support for more information.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Products</span>
          </div>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Active Products</span>
          </div>
          <p className="text-3xl font-bold">{activeProducts}</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-muted-foreground">Pending Review</span>
          </div>
          <p className="text-3xl font-bold">{pendingProducts}</p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Stock</span>
          </div>
          <p className="text-3xl font-bold">{totalStock.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Products</h2>
          <Link href="/seller/products" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding your first product to the marketplace.
            </p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              + Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                  {product.product_images[0] ? (
                    <img
                      src={product.product_images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)} CAD • {product.stock_quantity} in stock
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
