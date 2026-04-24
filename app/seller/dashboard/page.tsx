import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerDashboardData } from "@/app/actions/seller";
import { Package, DollarSign, AlertCircle, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react";
import { LuxuryLinkButton } from "@/components/seller/LuxuryButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  } catch {
    error = "Failed to load dashboard data";
  }

  if (!profile && !error) redirect("/seller/login");

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const pendingProducts = products.filter((p) => p.status === "pending").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "#EDE9F6", iconColor: "#4B1D8F" },
    { label: "Active Products", value: activeProducts, icon: CheckCircle, color: "#dcfce7", iconColor: "#16a34a" },
    { label: "Pending Review", value: pendingProducts, icon: Clock, color: "#fef9c3", iconColor: "#ca8a04" },
    { label: "Total Stock", value: totalStock.toLocaleString(), icon: DollarSign, color: "#EDE9F6", iconColor: "#4B1D8F" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {profile?.business_name || "Seller"} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your store today.</p>
        </div>
        <LuxuryLinkButton href="/seller/products/new" size="md">
          <Plus className="h-4 w-4" />
          Add Product
        </LuxuryLinkButton>
      </div>

      {/* Status banners */}
      {profile?.status === "pending" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#fef9c3", borderColor: "#fde047" }}>
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Account Pending Approval</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Your seller account is under review. You can add products, but they won't be visible until approved.
            </p>
          </div>
        </div>
      )}
      {profile?.status === "suspended" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200" style={{ backgroundColor: "#fef2f2" }}>
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Account Suspended</p>
            <p className="text-xs text-red-700 mt-0.5">Your seller account has been suspended. Contact support for more information.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3"
              style={{ backgroundColor: stat.color }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Products</h3>
            <LuxuryLinkButton href="/seller/products" variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </LuxuryLinkButton>
        </div>

        {products.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
              style={{ backgroundColor: "#EDE9F6" }}
            >
              <Package className="h-7 w-7" style={{ color: "#4B1D8F" }} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">No products yet</h4>
            <p className="text-sm text-gray-500 mb-4">Start by adding your first product to the marketplace.</p>
            <LuxuryLinkButton href="/seller/products/new" size="md">
              <Plus className="h-4 w-4" />
              Add Your First Product
            </LuxuryLinkButton>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: "#EDE9F6" }}>
                  {product.product_images[0] ? (
                    <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-5 w-5" style={{ color: "#4B1D8F" }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price.toFixed(2)} CAD · {product.stock_quantity} in stock</p>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    product.status === "active"
                      ? "bg-green-100 text-green-700"
                      : product.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : product.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
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
