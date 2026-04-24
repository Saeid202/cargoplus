import { Package } from "lucide-react";

const PURPLE = "#4B1D8F";

export default function SellerOrdersPage() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Orders</h2>
        </div>
        <div className="py-20 text-center">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5"
            style={{ backgroundColor: "#EDE9F6" }}
          >
            <Package className="h-8 w-8" style={{ color: PURPLE }} />
          </div>
          <p className="font-semibold text-gray-900 text-lg">No orders yet</p>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            When customers place orders for your products, they will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
